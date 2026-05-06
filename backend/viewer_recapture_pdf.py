import os
import re
import sys
import time
from pathlib import Path
from typing import Optional, Tuple

from dotenv import load_dotenv
from playwright.sync_api import TimeoutError as PlaywrightTimeoutError
from playwright.sync_api import sync_playwright
from pypdf import PdfReader, PdfWriter

if sys.stdout.encoding != 'utf-8':
    sys.stdout.reconfigure(encoding='utf-8')

BASE_DIR = Path(__file__).resolve().parent
ROOT_DIR = BASE_DIR.parent if BASE_DIR.name == "backend" else BASE_DIR

load_dotenv(ROOT_DIR / ".env")

TARGET_URL = os.getenv("TARGET_URL")
SOURCE_PDF_PATH = os.getenv("SOURCE_PDF_PATH")
OUTPUT_DIR = ROOT_DIR / "output"
FRONTEND_DIST_DIR = ROOT_DIR / "frontend" / "dist"
TEMP_DIR = OUTPUT_DIR / "temp"
PAGE_COUNTER_PATTERN = re.compile(r"(\d+)\s*/\s*(\d+)")
INITIAL_READY_TIMEOUT_SECONDS = 8.0
INITIAL_READY_POLL_SECONDS = 0.4
PAGE_NAVIGATION_TIMEOUT_SECONDS = 1.4
PAGE_NAVIGATION_POLL_SECONDS = 0.12
CAPTURE_SETTLE_SECONDS = 1.0
FINAL_OUTPUT_PATH = OUTPUT_DIR / "working_document.pdf"


def parse_recapture_pages():
    raw_pages = os.getenv("RECAPTURE_PAGES", "").strip()
    if not raw_pages:
        return []

    pages = []
    for token in raw_pages.split(","):
        token = token.strip()
        if not token:
            continue
        try:
            page_number = int(token)
        except ValueError:
            continue
        if page_number > 0 and page_number not in pages:
            pages.append(page_number)
    return sorted(pages)


def extract_page_position(page) -> Optional[Tuple[int, int]]:
    try:
        body_text = page.locator("body").inner_text(timeout=1000)
    except Exception:
        return None

    match = PAGE_COUNTER_PATTERN.search(body_text)
    if not match:
        return None
    return int(match.group(1)), int(match.group(2))


def detect_total_pages(page):
    deadline = time.monotonic() + INITIAL_READY_TIMEOUT_SECONDS
    while time.monotonic() < deadline:
        page_position = extract_page_position(page)
        if page_position is not None:
            return page_position[1]
        time.sleep(INITIAL_READY_POLL_SECONDS)

    error_message = "ERROR: Failed to detect total pages within the ready timeout. Aborting."
    print(error_message, file=sys.stderr)
    raise RuntimeError(error_message)


def hide_viewer_ui(page):
    page.evaluate(
        """() => {
            const selectors = ['header', 'footer', '[role="toolbar"]', 'button', 'div[class*="Header"]', '.notion-topbar', '.UiPresenter_presenter_controls'];
            selectors.forEach((selector) => {
                document.querySelectorAll(selector).forEach((element) => {
                    element.style.display = 'none';
                });
            });
        }"""
    )


def wait_for_page_advance(page, expected_minimum_page):
    deadline = time.monotonic() + PAGE_NAVIGATION_TIMEOUT_SECONDS
    while time.monotonic() < deadline:
        page_position = extract_page_position(page)
        if page_position is not None and page_position[0] >= expected_minimum_page:
            return page_position[0]
        time.sleep(PAGE_NAVIGATION_POLL_SECONDS)
    return expected_minimum_page


def move_to_page(page, current_page, target_page):
    while current_page < target_page:
        page.keyboard.press("ArrowRight")
        current_page = wait_for_page_advance(page, current_page + 1)
    return current_page


def capture_page_pdf(page, current_page):
    hide_viewer_ui(page)
    time.sleep(CAPTURE_SETTLE_SECONDS)

    temp_pdf_path = TEMP_DIR / f"temp_page_{current_page}.pdf"
    if temp_pdf_path.exists():
        temp_pdf_path.unlink()

    page.pdf(path=str(temp_pdf_path), width="1920px", height="1080px", print_background=True)
    return temp_pdf_path


def append_pdf_page(pdf_writer, pdf_path):
    pdf_reader = PdfReader(pdf_path)
    if not pdf_reader.pages:
        raise RuntimeError(f"No pages found in {pdf_path}")
    pdf_writer.add_page(pdf_reader.pages[0])


def export_recaptured_document_pdf():
    if not TARGET_URL:
        raise RuntimeError("TARGET_URL is required.")
    source_pdf_path = Path(SOURCE_PDF_PATH) if SOURCE_PDF_PATH else None
    if source_pdf_path is None or not source_pdf_path.exists():
        raise RuntimeError("SOURCE_PDF_PATH is required for recapture.")

    recapture_pages = parse_recapture_pages()
    if not recapture_pages:
        raise RuntimeError("RECAPTURE_PAGES is required for recapture.")

    TEMP_DIR.mkdir(parents=True, exist_ok=True)
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(headless=True)
        context = browser.new_context(viewport={"width": 1920, "height": 1080})
        page = context.new_page()

        print("Opening target page...")
        page.goto(TARGET_URL, wait_until="domcontentloaded")
        try:
            page.wait_for_load_state("networkidle", timeout=2500)
        except PlaywrightTimeoutError:
            pass

        total_pages = detect_total_pages(page)
        print(f"Detected total pages: {total_pages}")

        base_reader = PdfReader(str(source_pdf_path))
        if len(base_reader.pages) != total_pages:
            raise RuntimeError(
                f"Base PDF page count mismatch: source={len(base_reader.pages)}, captured={total_pages}"
            )

        valid_pages = [page_num for page_num in recapture_pages if page_num <= total_pages]
        if not valid_pages:
            raise RuntimeError("No valid recapture pages were provided.")

        print(f"Recapturing pages: {valid_pages}")
        captured_page_paths = {}
        current_page = 1

        for target_page in valid_pages:
            current_page = move_to_page(page, current_page, target_page)
            print(f"Captured page {current_page} of {total_pages}")
            captured_page_paths[target_page] = capture_page_pdf(page, current_page)

        pdf_writer = PdfWriter()
        for page_number in range(1, total_pages + 1):
            if page_number in captured_page_paths:
                append_pdf_page(pdf_writer, captured_page_paths[page_number])
            else:
                pdf_writer.add_page(base_reader.pages[page_number - 1])

        print(f"Writing merged PDF to {FINAL_OUTPUT_PATH}")
        with FINAL_OUTPUT_PATH.open("wb") as output_file:
            pdf_writer.write(output_file)

        browser.close()
        print(f"Export complete. Temporary files are stored in {TEMP_DIR}")


if __name__ == "__main__":
    export_recaptured_document_pdf()
