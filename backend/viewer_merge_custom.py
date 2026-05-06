import sys
if sys.stdout.encoding != 'utf-8':
    sys.stdout.reconfigure(encoding='utf-8')

import os
import re
from pathlib import Path

from dotenv import load_dotenv
from PIL import Image
from pypdf import PdfWriter

BASE_DIR = Path(__file__).resolve().parent
ROOT_DIR = BASE_DIR.parent if BASE_DIR.name == "backend" else BASE_DIR

load_dotenv(ROOT_DIR / ".env")

OUTPUT_DIR = ROOT_DIR / "output"
FRONTEND_DIST_DIR = ROOT_DIR / "frontend" / "dist"
TEMP_DIR = OUTPUT_DIR / "temp"


def get_unique_filename(directory, base_filename):
    name, ext = os.path.splitext(base_filename)
    counter = 1
    final_path = Path(directory) / base_filename
    while final_path.exists():
        new_filename = f"{name} ({counter}){ext}"
        final_path = Path(directory) / new_filename
        counter += 1
    return final_path


def merge_with_custom_captures():
    if not TEMP_DIR.exists():
        print(f"Temp folder not found: {TEMP_DIR}")
        return

    output_path = get_unique_filename(OUTPUT_DIR, "final_document_fixed.pdf")
    pdf_writer = PdfWriter()

    all_files = os.listdir(TEMP_DIR)
    pdf_pattern = re.compile(r"temp_page_(?:.*_)?(\d+)\.pdf$")

    pdf_map = {}
    for name in all_files:
        match = pdf_pattern.search(name)
        if match:
            page_num = int(match.group(1))
            pdf_map[page_num] = TEMP_DIR / name

    if not pdf_map:
        print(f"No PDF fragments found to merge. Checked: {TEMP_DIR}")
        print(f"Current temp directory sample: {all_files[:5]}")
        return

    sorted_pages = sorted(pdf_map.keys())
    print(f"Merging {len(sorted_pages)} page fragment(s)...")

    for page_number in sorted_pages:
        custom_png_path = TEMP_DIR / f"temp_page_{page_number}.png"

        if custom_png_path.exists():
            print(f" > [Page {page_number}] Replacing with manual PNG capture...")
            img = Image.open(custom_png_path).convert("RGB")
            temp_img_pdf = TEMP_DIR / f"temp_converted_{page_number}.pdf"
            img.save(temp_img_pdf, "PDF", resolution=100.0)
            pdf_writer.append(str(temp_img_pdf))
            temp_img_pdf.unlink()
        else:
            print(f" > [Page {page_number}] Using existing PDF fragment...")
            pdf_writer.append(str(pdf_map[page_number]))

    with output_path.open("wb") as output_file:
        pdf_writer.write(output_file)

    print("-" * 30)
    print(f"Merge complete. Final file: {output_path}")


if __name__ == "__main__":
    merge_with_custom_captures()
