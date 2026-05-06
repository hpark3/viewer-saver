import ast
import asyncio
import json
import ast
import os
import shutil
import subprocess
import sys
import threading
import time
import re
from datetime import datetime
from pathlib import Path
from typing import Literal, Optional, Union

from dotenv import load_dotenv
from fastapi import FastAPI, File, HTTPException, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from pypdf import PdfReader
import sentry_sdk
from sse_starlette.sse import EventSourceResponse

BASE_DIR = Path(__file__).resolve().parent
ROOT_DIR = BASE_DIR.parent if BASE_DIR.name == "backend" else BASE_DIR

load_dotenv(ROOT_DIR / ".env")
sentry_sdk.init(dsn=os.getenv("SENTRY_DSN", ""))

FRONTEND_DIST_DIR = ROOT_DIR / "frontend" / "dist"
OUTPUT_DIR = ROOT_DIR / "output"
TEMP_DIR = OUTPUT_DIR / "temp"
PREVIEW_DIR = OUTPUT_DIR / "previews"
WORKING_PDF_NAME = "working_document.pdf"
DEFAULT_POPPLER_BIN_CANDIDATES = [
    r"C:\poppler\Library\bin",
    r"C:\Program Files\poppler\Library\bin",
    r"C:\Program Files (x86)\poppler\Library\bin",
    str(ROOT_DIR / "poppler" / "Library" / "bin"),
]
CAPTURED_PAGE_PATTERN = re.compile(r"Captured page\s+(\d+)\s+of\s+(\d+)", re.IGNORECASE)
TOTAL_PAGES_PATTERN = re.compile(r"Detected total pages:\s*(\d+)", re.IGNORECASE)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

assets_dir = FRONTEND_DIST_DIR / "assets"
if assets_dir.exists():
    app.mount("/assets", StaticFiles(directory=str(assets_dir)), name="frontend-assets")

# --- State ---
log_lines = []
stream_events = []
job_running = False
job_cancelled = False
error_pages = []
current_proc: Optional[subprocess.Popen] = None
output_path: Optional[Path] = None
last_auto_output_path: Optional[Path] = None
client_saved_filename: Optional[str] = None
current_capture_url: Optional[str] = None


def append_event(event: dict):
    stream_events.append(event)


def append_log(line: str):
    log_lines.append(line)
    append_event({"type": "log", "message": line})


def get_export_script(mode: Literal["fast", "quality"]) -> str:
    return "viewer_export_fast.py" if mode == "fast" else "viewer_export_pdf.py"


def get_working_pdf_path() -> Path:
    return OUTPUT_DIR / WORKING_PDF_NAME

def get_latest_pdf_path() -> Optional[Path]:
    pdf_files = sorted(
        OUTPUT_DIR.glob("*.pdf"),
        key=lambda p: p.stat().st_mtime,
        reverse=True,
    )
    return pdf_files[0] if pdf_files else None


def get_active_pdf_path() -> Optional[Path]:
    if output_path is not None and output_path.exists() and output_path.is_file():
        return output_path
    return get_latest_pdf_path()


def get_frontend_index_path() -> Path:
    return FRONTEND_DIST_DIR / "index.html"


def maybe_serve_frontend_asset(requested_path: str) -> Optional[FileResponse]:
    if not requested_path:
        return None

    candidate = (FRONTEND_DIST_DIR / requested_path).resolve()
    try:
        candidate.relative_to(FRONTEND_DIST_DIR.resolve())
    except ValueError:
        return None

    if candidate.exists() and candidate.is_file():
        return FileResponse(str(candidate))
    return None


def get_last_auto_output_path() -> Optional[Path]:
    if last_auto_output_path is not None and last_auto_output_path.exists() and last_auto_output_path.is_file():
        return last_auto_output_path
    return get_active_pdf_path()


def get_pdf_page_count(pdf_path: Path) -> int:
    with pdf_path.open("rb") as pdf_file:
        return len(PdfReader(pdf_file).pages)


def get_preview_cache_dir(pdf_path: Path) -> Path:
    version = pdf_path.stat().st_mtime_ns
    return PREVIEW_DIR / f"{pdf_path.stem}_{version}"


def get_preview_cache_path(pdf_path: Path, page_number: int) -> Path:
    return get_preview_cache_dir(pdf_path) / f"page_{page_number:04d}.jpg"


def build_preview_url(pdf_path: Path, page_number: int) -> str:
    version = pdf_path.stat().st_mtime_ns
    return f"/page-preview/{page_number}?v={version}"


def is_valid_poppler_bin_dir(path_value: Optional[str]) -> bool:
    if not path_value:
        return False

    poppler_dir = Path(path_value)
    return (
        poppler_dir.exists()
        and poppler_dir.is_dir()
        and (poppler_dir / "pdfinfo.exe").exists()
        and (poppler_dir / "pdftoppm.exe").exists()
    )


def resolve_poppler_bin_path() -> Optional[str]:
    if shutil.which("pdfinfo") and shutil.which("pdftoppm"):
        return None

    env_path = os.getenv("POPPLER_BIN_PATH", "").strip()
    candidates = [env_path, *DEFAULT_POPPLER_BIN_CANDIDATES]
    for candidate in candidates:
        if is_valid_poppler_bin_dir(candidate):
            return candidate
    return None


def get_poppler_install_help() -> str:
    return (
        "Poppler for Windows is required to render Stage 2 page previews. "
        "Install Poppler and either add its bin folder to PATH or set POPPLER_BIN_PATH."
    )


def get_page_preview_status() -> tuple[Optional[str], Optional[str]]:
    resolved_poppler_bin = resolve_poppler_bin_path()
    if resolved_poppler_bin is None and not (shutil.which("pdfinfo") and shutil.which("pdftoppm")):
        return "missing_poppler", get_poppler_install_help()
    return None, None


def ensure_page_preview(pdf_path: Path, page_number: int) -> Path:
    from pdf2image import convert_from_path
    from pdf2image.exceptions import PDFInfoNotInstalledError

    total_pages = get_pdf_page_count(pdf_path)
    if page_number < 1 or page_number > total_pages:
        raise HTTPException(status_code=404, detail="Requested page preview does not exist.")

    preview_path = get_preview_cache_path(pdf_path, page_number)
    if preview_path.exists():
        return preview_path

    preview_path.parent.mkdir(parents=True, exist_ok=True)
    poppler_path = resolve_poppler_bin_path()

    try:
        rendered_pages = convert_from_path(
            str(pdf_path),
            dpi=72,
            first_page=page_number,
            last_page=page_number,
            fmt="jpeg",
            poppler_path=poppler_path,
        )
    except PDFInfoNotInstalledError as exc:
        raise HTTPException(status_code=503, detail=get_poppler_install_help()) from exc
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Failed to render the requested page preview: {exc}") from exc

    if not rendered_pages:
        raise HTTPException(status_code=500, detail="Failed to render the requested page preview.")

    rendered_page = rendered_pages[0].convert("RGB")
    rendered_page.thumbnail((480, 640))
    rendered_page.save(preview_path, format="JPEG", quality=75, optimize=True)
    return preview_path

def reveal_in_file_manager(path: Path):
    if sys.platform.startswith("win"):
        subprocess.Popen(["explorer", "/select,", str(path)])
        return
    if sys.platform == "darwin":
        subprocess.Popen(["open", "-R", str(path)])
        return
    subprocess.Popen(["xdg-open", str(path.parent)])

def parse_error_pages(line: str):
    match = re.search(r"(\[[^\]]*\])", line)
    if not match:
        return None

    try:
        parsed = ast.literal_eval(match.group(1))
    except (SyntaxError, ValueError):
        return None

    if not isinstance(parsed, list):
        return None

    pages = []
    for value in parsed:
        try:
            pages.append(int(value))
        except (TypeError, ValueError):
            return None
    return pages if pages or match.group(1) == "[]" else None


def update_progress(*, started_at: float, completed_pages: Optional[int] = None, total_pages: Optional[int] = None):
    payload: dict[str, Union[int, float, str]] = {"type": "progress"}

    if completed_pages is not None:
        payload["completed_pages"] = completed_pages

    if total_pages is not None:
        payload["total_pages"] = total_pages

    if completed_pages is not None and total_pages is not None and total_pages > 0:
        progress = min(100.0, round((completed_pages / total_pages) * 100, 2))
        elapsed_seconds = max(time.monotonic() - started_at, 0.0)
        average_seconds_per_page = elapsed_seconds / max(completed_pages, 1)
        remaining_seconds = max(0, int(round((total_pages - completed_pages) * average_seconds_per_page)))
        payload["progress"] = progress
        payload["average_seconds_per_page"] = round(average_seconds_per_page, 2)
        payload["remaining_seconds"] = remaining_seconds

    append_event(payload)


def parse_progress_line(line: str, *, started_at: float, known_total_pages: Optional[int]) -> Optional[int]:
    total_match = TOTAL_PAGES_PATTERN.search(line)
    if total_match:
        detected_total_pages = int(total_match.group(1))
        update_progress(started_at=started_at, total_pages=detected_total_pages)
        return detected_total_pages

    captured_match = CAPTURED_PAGE_PATTERN.search(line)
    if captured_match:
        completed_pages = int(captured_match.group(1))
        total_pages = int(captured_match.group(2))
        update_progress(
            started_at=started_at,
            completed_pages=completed_pages,
            total_pages=total_pages,
        )
        return total_pages

    if known_total_pages is not None and "Writing merged PDF" in line:
        update_progress(
            started_at=started_at,
            completed_pages=known_total_pages,
            total_pages=known_total_pages,
        )

    return known_total_pages


def stop_process(proc: Optional[subprocess.Popen]):
    if proc is None or proc.poll() is not None:
        return

    try:
        if sys.platform.startswith("win"):
            subprocess.run(
                ["taskkill", "/PID", str(proc.pid), "/T", "/F"],
                capture_output=True,
                text=True,
                check=False,
            )
        else:
            proc.terminate()
            proc.wait(timeout=5)
    except Exception:
        try:
            proc.kill()
            proc.wait(timeout=5)
        except Exception:
            pass


def emit_terminal_status(status: Literal["completed", "cancelled", "failed"], *, message: Optional[str] = None):
    payload: dict[str, str] = {"type": "status", "status": status}
    if message:
        payload["message"] = message
    append_event(payload)


def clear_directory_contents(directory: Path) -> tuple[int, int]:
    directory.mkdir(parents=True, exist_ok=True)
    deleted_count = 0
    failed_count = 0

    for entry in directory.iterdir():
        try:
            if entry.is_dir() and not entry.is_symlink():
                shutil.rmtree(entry)
            else:
                entry.unlink()
            deleted_count += 1
        except Exception:
            failed_count += 1

    return deleted_count, failed_count


def clear_output_pdfs(*, keep: Optional[Path] = None) -> tuple[int, int]:
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    deleted_count = 0
    failed_count = 0
    keep_path = keep.resolve() if keep is not None else None

    for entry in OUTPUT_DIR.glob("*.pdf"):
        try:
            if keep_path is not None and entry.resolve() == keep_path:
                continue
            entry.unlink()
            deleted_count += 1
        except Exception:
            failed_count += 1

    return deleted_count, failed_count


def cleanup_output_directories_for_new_run() -> dict[str, tuple[int, int]]:
    return {
        "temp": clear_directory_contents(TEMP_DIR),
        "previews": clear_directory_contents(PREVIEW_DIR),
        "pdfs": clear_output_pdfs(),
    }


def prune_output_to_active_pdf(active_pdf: Optional[Path]) -> tuple[int, int]:
    if active_pdf is None:
        return (0, 0)
    return clear_output_pdfs(keep=active_pdf)


def reset_output_references():
    global output_path, last_auto_output_path

    if output_path is not None and (not output_path.exists() or not output_path.is_file()):
        output_path = None
    if last_auto_output_path is not None and (not last_auto_output_path.exists() or not last_auto_output_path.is_file()):
        last_auto_output_path = None


@app.on_event("startup")
def cleanup_stale_output_on_startup():
    cleanup_output_directories_for_new_run()
    reset_output_references()


@app.on_event("shutdown")
def cleanup_stale_output_on_shutdown():
    cleanup_output_directories_for_new_run()
    reset_output_references()


def clear_manual_capture_temp_pngs() -> tuple[int, int]:
    """Remove only manual-upload temp PNG files before automatic recapture."""
    TEMP_DIR.mkdir(parents=True, exist_ok=True)
    deleted_count = 0
    failed_count = 0
    for entry in TEMP_DIR.glob("temp_page_*.png"):
        if not entry.is_file() and not entry.is_symlink():
            continue
        try:
            entry.unlink()
            deleted_count += 1
        except Exception:
            failed_count += 1
    return deleted_count, failed_count
# --- Request Models ---

class RunRequest(BaseModel):
    url: str
    mode: Literal["fast", "quality"] = "quality"


class RecaptureRequest(BaseModel):
    pages: list[int]
    mode: str = "quality"
    url: Optional[str] = None


class ClientSaveRequest(BaseModel):
    filename: str


# --- Routes ---

@app.get("/")
def root():
    index_path = get_frontend_index_path()
    if index_path.exists():
        return FileResponse(str(index_path))
    return {
        "status": "ok",
        "service": "ViewerSaver",
        "frontend": "not_built",
        "hint": "Run `cd frontend && npm install && npm run build` or use `npm run dev` in the frontend directory.",
    }


@app.get("/status")
def status():
    return {"running": job_running}


@app.post("/cancel")
def cancel():
    global job_running, job_cancelled, current_proc

    proc = current_proc
    job_cancelled = True
    stop_process(proc)
    current_proc = None
    job_running = False
    emit_terminal_status("cancelled", message="Capture cancelled.")
    return {"ok": True}


@app.get("/result")
def result():
    active_pdf = get_active_pdf_path()
    file_size_bytes = None
    total_pages = None
    page_previews = []
    page_preview_error_code = None
    page_preview_error_message = None
    if active_pdf is not None:
        try:
            file_size_bytes = active_pdf.stat().st_size
        except OSError:
            file_size_bytes = None
        try:
            total_pages = get_pdf_page_count(active_pdf)
            page_preview_error_code, page_preview_error_message = get_page_preview_status()
            if page_preview_error_code is None:
                page_previews = [
                    {"page": page_number, "image_url": build_preview_url(active_pdf, page_number)}
                    for page_number in range(1, total_pages + 1)
                ]
        except Exception:
            total_pages = None
            page_previews = []
            page_preview_error_code = "preview_generation_failed"
            page_preview_error_message = "Failed to prepare the extracted page previews."

    return {
        "error_pages": error_pages,
        "file_size_bytes": file_size_bytes,
        "total_pages": total_pages,
        "page_previews": page_previews,
        "page_preview_error_code": page_preview_error_code,
        "page_preview_error_message": page_preview_error_message,
    }
@app.get("/open-output")
def open_output():
    if job_running:
        raise HTTPException(status_code=409, detail="작업이 진행 중입니다.")

    try:
        OUTPUT_DIR.mkdir(exist_ok=True)
        os.startfile(str(OUTPUT_DIR))
        return {"ok": True}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"output 폴더를 열지 못했습니다: {e}")


@app.post("/run")
def run(body: RunRequest):
    global job_running, job_cancelled, log_lines, stream_events, error_pages, current_proc, output_path, last_auto_output_path, client_saved_filename, current_capture_url

    if job_running:
        raise HTTPException(status_code=409, detail="A capture job is already in progress. Please try again after it finishes.")

    url = body.url.strip()
    if not url:
        raise HTTPException(status_code=400, detail="URL is required.")

    log_lines = []
    stream_events = []
    error_pages = []
    output_path = None
    last_auto_output_path = None
    client_saved_filename = None
    current_capture_url = url
    job_running = True
    job_cancelled = False

    script = get_export_script(body.mode)

    def do_work():
        global job_running, job_cancelled, error_pages, current_proc, output_path, last_auto_output_path, client_saved_filename
        started_at = time.monotonic()
        known_total_pages: Optional[int] = None
        terminal_status_emitted = False

        try:
            try:
                cleanup_results = cleanup_output_directories_for_new_run()
                temp_deleted, temp_failed = cleanup_results["temp"]
                preview_deleted, preview_failed = cleanup_results["previews"]
                pdf_deleted, pdf_failed = cleanup_results["pdfs"]
                append_log(
                    "Output cleanup completed: "
                    f"temp deleted {temp_deleted}, failed {temp_failed}; "
                    f"previews deleted {preview_deleted}, failed {preview_failed}; "
                    f"pdfs deleted {pdf_deleted}, failed {pdf_failed}."
                )
            except Exception as cleanup_error:
                append_log(f"Temp cleanup skipped due to non-fatal error: {cleanup_error}")
            env = os.environ.copy()
            env["TARGET_URL"] = url
            env["PYTHONUNBUFFERED"] = "1"
            short_url = url[:70] + "..." if len(url) > 70 else url
            append_log(f"Target URL: {short_url}")
            append_log("[Step 1] Starting PDF capture...")
            append_event({"type": "status", "status": "running", "mode": body.mode})

            proc = subprocess.Popen(
                [sys.executable, "-u", str(BASE_DIR / script)],
                env=env,
                stdout=subprocess.PIPE,
                stderr=subprocess.STDOUT,
                text=True,
                encoding="utf-8",
                errors="replace",
                cwd=str(ROOT_DIR),
            )
            current_proc = proc
            for line in proc.stdout or []:
                cleaned = line.rstrip()
                append_log(cleaned)
                known_total_pages = parse_progress_line(
                    cleaned,
                    started_at=started_at,
                    known_total_pages=known_total_pages,
                )
            proc.wait()
            current_proc = None

            if job_cancelled:
                terminal_status_emitted = True
                return

            if proc.returncode == 0:
                append_log("Capture complete. Starting the error check immediately...")

                if job_cancelled:
                    terminal_status_emitted = True
                    return

                if body.mode == "fast":
                    output_path = get_latest_pdf_path()
                    last_auto_output_path = output_path
                    prune_output_to_active_pdf(output_path)
                    client_saved_filename = None
                    append_log("[Step 2] Skipped for fast mode.")
                    emit_terminal_status("completed", message="Capture complete.")
                    terminal_status_emitted = True
                    return

                append_log("[Step 2] Checking pages for image loading errors...")
                proc2 = subprocess.Popen(
                    [sys.executable, "-u", str(BASE_DIR / "viewer_check_errors.py")],
                    env=env,
                    stdout=subprocess.PIPE,
                    stderr=subprocess.STDOUT,
                    text=True,
                    encoding="utf-8",
                    errors="replace",
                    cwd=str(ROOT_DIR),
                )
                current_proc = proc2
                for line in proc2.stdout or []:
                    cleaned = line.rstrip()
                    append_log(cleaned)

                    parsed_pages = parse_error_pages(cleaned)
                    if parsed_pages is not None:
                        error_pages = parsed_pages

                proc2.wait()
                current_proc = None

                if job_cancelled:
                    terminal_status_emitted = True
                    return

                output_path = get_latest_pdf_path()
                last_auto_output_path = output_path
                prune_output_to_active_pdf(output_path)
                client_saved_filename = None
                append_log("All tasks completed.")
                emit_terminal_status("completed", message="Capture complete.")
                terminal_status_emitted = True
            else:
                append_log("Step 1 failed. Please review the logs.")
                emit_terminal_status("failed", message="Capture failed.")
                terminal_status_emitted = True

        except Exception as e:
            append_log(f"Server error: {e}")
            emit_terminal_status("failed", message=str(e))
            terminal_status_emitted = True
        finally:
            if job_cancelled and not terminal_status_emitted:
                emit_terminal_status("cancelled", message="Capture cancelled.")
            elif not terminal_status_emitted and not job_cancelled:
                emit_terminal_status("failed", message="Capture stopped unexpectedly.")
            job_running = False
            current_proc = None

    threading.Thread(target=do_work, daemon=True).start()
    return {"ok": True}


@app.get("/stream")
async def stream():
    """Streams structured job events over Server-Sent Events."""

    async def event_generator():
        sent = 0
        while True:
            while sent < len(stream_events):
                event = stream_events[sent]
                sent += 1
                yield {"data": json.dumps(event, ensure_ascii=False)}
                if event.get("type") == "status" and event.get("status") in {"completed", "cancelled", "failed"}:
                    return
            await asyncio.sleep(0.3)

    return EventSourceResponse(event_generator())


@app.post("/recapture")
def recapture(body: RecaptureRequest):
    global job_running, log_lines, stream_events, output_path, last_auto_output_path, client_saved_filename, current_capture_url, current_proc

    if job_running:
        raise HTTPException(status_code=409, detail="A capture job is already in progress. Please try again after it finishes.")

    if not body.pages:
        raise HTTPException(status_code=400, detail="pages list is required.")

    requested_url = body.url.strip() if body.url else ""
    target_url = requested_url or current_capture_url
    if not target_url:
        raise HTTPException(status_code=400, detail="recapture url is required.")

    source_pdf_path = get_last_auto_output_path()

    log_lines = []
    stream_events = []
    output_path = None
    client_saved_filename = None
    current_capture_url = target_url
    job_running = True

    script = "viewer_recapture_pdf.py"

    def do_recapture():
        global job_running, output_path, last_auto_output_path, client_saved_filename, current_proc
        started_at = time.monotonic()
        known_total_pages: Optional[int] = None
        try:
            import subprocess
            env = os.environ.copy()
            env["TARGET_URL"] = target_url
            env["RECAPTURE_PAGES"] = ",".join(str(p) for p in body.pages)
            env["PYTHONUNBUFFERED"] = "1"
            if source_pdf_path is not None:
                env["SOURCE_PDF_PATH"] = str(source_pdf_path)
            append_log(f"[Recapture] Target pages: {body.pages}, mode: {body.mode}")
            deleted_count, failed_count = clear_manual_capture_temp_pngs()
            if failed_count > 0:
                append_log(
                    f"[Recapture] Manual temp PNG cleanup completed with warnings: deleted {deleted_count} file(s), "
                    f"failed to delete {failed_count} file(s)."
                )
            else:
                append_log(f"[Recapture] Manual temp PNG cleanup completed: deleted {deleted_count} file(s).")

            append_event({"type": "status", "status": "running", "mode": body.mode})
            proc = subprocess.Popen(
                [sys.executable, "-u", str(BASE_DIR / script)],
                env=env,
                stdout=subprocess.PIPE,
                stderr=subprocess.STDOUT,
                text=True,
                encoding="utf-8",
                errors="replace",
                cwd=str(ROOT_DIR),
            )
            current_proc = proc
            for line in proc.stdout or []:
                cleaned = line.rstrip()
                append_log(cleaned)
                known_total_pages = parse_progress_line(
                    cleaned,
                    started_at=started_at,
                    known_total_pages=known_total_pages,
                )
            proc.wait()
            current_proc = None

            if proc.returncode == 0:
                output_path = get_latest_pdf_path()
                last_auto_output_path = output_path
                prune_output_to_active_pdf(output_path)
                client_saved_filename = None
                append_log("Recapture complete!")
                emit_terminal_status("completed", message="Recapture complete.")
            else:
                append_log("Recapture failed. Please review the logs.")
                emit_terminal_status("failed", message="Recapture failed.")

        except Exception as e:
            append_log(f"Server error: {e}")
            emit_terminal_status("failed", message=str(e))
        finally:
            job_running = False
            current_proc = None

    threading.Thread(target=do_recapture, daemon=True).start()
    return {"ok": True}


@app.post("/upload-page")
async def upload_page(page: int = Form(...), file: UploadFile = File(...)):
    try:
        TEMP_DIR.mkdir(parents=True, exist_ok=True)
        dest = TEMP_DIR / f"temp_page_{page}.png"
        content = await file.read()
        with open(dest, "wb") as f:
            f.write(content)
        return {"ok": True, "path": str(dest)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"파일 업로드 실패: {e}")


@app.post("/merge")
def merge():
    global output_path, client_saved_filename

    try:
        from viewer_merge_custom import merge_with_custom_captures
        merge_with_custom_captures()
        output_path = get_latest_pdf_path()
        prune_output_to_active_pdf(output_path)
        client_saved_filename = None
        return {"ok": True}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"병합 실패: {e}")


@app.get("/preview-pdf")
def preview_pdf():
    latest_pdf = get_latest_pdf_path()
    if latest_pdf is None:
        raise HTTPException(status_code=404, detail="PDF 미리보기 소스를 찾을 수 없습니다.")
    return FileResponse(
        path=str(latest_pdf),
        media_type="application/pdf",
        filename=latest_pdf.name,
    )


@app.get("/page-preview/{page_number}")
def page_preview(page_number: int):
    active_pdf = get_active_pdf_path()
    if active_pdf is None:
        raise HTTPException(status_code=404, detail="PDF preview source is unavailable.")

    preview_path = ensure_page_preview(active_pdf, page_number)
    return FileResponse(
        path=str(preview_path),
        media_type="image/jpeg",
        filename=preview_path.name,
        headers={"Cache-Control": "no-cache, no-store, must-revalidate"},
    )
@app.post("/notify-client-save")
def notify_client_save(body: ClientSaveRequest):
    global client_saved_filename

    filename = body.filename.strip()
    client_saved_filename = filename or None
    return {"ok": True}


@app.post("/open-folder")
def open_folder():
    try:
        if client_saved_filename:
            downloads_dir = Path(os.environ.get("USERPROFILE", "~")) / "Downloads"
            downloads_path = downloads_dir / client_saved_filename
            if downloads_path.exists() and downloads_path.is_file():
                reveal_in_file_manager(downloads_path)
                return {"ok": True}

        active_pdf = get_active_pdf_path()
        if active_pdf is not None:
            reveal_in_file_manager(active_pdf)
            return {"ok": True}

        OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
        reveal_in_file_manager(OUTPUT_DIR)
        return {"ok": True}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to open folder: {e}")

@app.post("/save")
def save():
    global output_path

    latest_pdf = get_latest_pdf_path()
    if latest_pdf is None:
        raise HTTPException(status_code=404, detail="저장된 PDF 파일을 찾을 수 없습니다.")

    src = latest_pdf
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    dest_name = f"saved_{timestamp}.pdf"
    dest = OUTPUT_DIR / dest_name

    try:
        shutil.copy2(str(src), str(dest))
        output_path = dest
        return {"path": str(dest)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"다운로드 실패: {e}")

@app.get("/{full_path:path}")
def frontend_fallback(full_path: str):
    asset_response = maybe_serve_frontend_asset(full_path)
    if asset_response is not None:
        return asset_response

    index_path = get_frontend_index_path()
    if index_path.exists():
        return FileResponse(str(index_path))

    raise HTTPException(status_code=404, detail="Frontend build not found.")


if __name__ == "__main__":
    import uvicorn
    print("=" * 50)
    print("Canva PDF Saver 서버 시작 (FastAPI)")
    print("http://localhost:8000")
    print("=" * 50)
    uvicorn.run("server:app", host="0.0.0.0", port=8000, reload=False)
