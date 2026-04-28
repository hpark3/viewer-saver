import os
import re
import sys
import time

from dotenv import load_dotenv
from playwright.sync_api import sync_playwright
from pypdf import PdfWriter

if sys.stdout.encoding != 'utf-8':
    sys.stdout.reconfigure(encoding='utf-8')

load_dotenv()

TARGET_URL = os.getenv("TARGET_URL")
OUTPUT_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "output")
TEMP_DIR = os.path.join(OUTPUT_DIR, "temp")
FINAL_OUTPUT_PATH = os.path.join(OUTPUT_DIR, "working_document.pdf")


def detect_total_pages(page):
    for attempt in range(1, 4):
        try:
            page_text = page.locator("body").inner_text()
            match = re.search(r"(\d+)\s*/\s*(\d+)", page_text)
            if match:
                return int(match.group(2))
        except Exception:
            pass

        if attempt < 3:
            time.sleep(1)

    error_message = "ERROR: Failed to detect total pages after 3 attempts. Aborting."
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


def export_clean_document_pdf():
    os.makedirs(TEMP_DIR, exist_ok=True)
    os.makedirs(OUTPUT_DIR, exist_ok=True)

    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(headless=True)
        context = browser.new_context(viewport={"width": 1920, "height": 1080})
        page = context.new_page()

        print("Opening target page...")
        page.goto(TARGET_URL, wait_until="domcontentloaded")
        time.sleep(2)

        total_pages = detect_total_pages(page)
        print(f"Detected total pages: {total_pages}")

        pdf_writer = PdfWriter()

        for current_page in range(1, total_pages + 1):
            print(f"Captured page {current_page} of {total_pages}")

            if current_page > 1 and current_page % 20 == 0:
                print("Pausing for 10 seconds to avoid overloading the viewer")
                time.sleep(10)

            hide_viewer_ui(page)
            time.sleep(0.5)

            temp_pdf_path = os.path.join(TEMP_DIR, f"temp_page_{current_page}.pdf")
            if os.path.exists(temp_pdf_path):
                os.remove(temp_pdf_path)

            page.pdf(path=temp_pdf_path, width="1920px", height="1080px", print_background=True)
            pdf_writer.append(temp_pdf_path)

            if current_page < total_pages:
                page.keyboard.press("ArrowRight")
                time.sleep(0.5)

        print(f"Writing merged PDF to {FINAL_OUTPUT_PATH}")
        with open(FINAL_OUTPUT_PATH, "wb") as output_file:
            pdf_writer.write(output_file)

        browser.close()
        print(f"Export complete. Temporary files are stored in {TEMP_DIR}")


if __name__ == "__main__":
    export_clean_document_pdf()
