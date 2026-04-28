import sys
if sys.stdout.encoding != "utf-8":
    sys.stdout.reconfigure(encoding="utf-8")

import os
import re

import cv2
import numpy as np
from pdf2image import convert_from_path
from dotenv import load_dotenv

load_dotenv()

POPPLER_BIN_PATH = r"C:\poppler\Library\bin"
OUTPUT_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "output")
PDF_FILE_NAME = os.getenv("PDF_FILE_NAME", "final_document_complete.pdf")
PDF_PATH = os.path.join(OUTPUT_DIR, PDF_FILE_NAME)
USE_PNG_DIR = os.getenv("USE_PNG_DIR")


def is_loading_error(img_array):
    """Detect the known gray loading placeholder using the existing heuristic."""
    h, w, _ = img_array.shape
    # Analyze the center region and ignore the outer edges where UI chrome can appear.
    cz = img_array[h//10:9*h//10, w//10:9*w//10]

    # Build a mask for the viewer loading gray.
    gray_low = np.array([230, 230, 230])
    gray_high = np.array([242, 242, 242])
    mask = cv2.inRange(cz, gray_low, gray_high)

    contours, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

    for cnt in contours:
        x, y, bw, bh = cv2.boundingRect(cnt)

        if bw < 80 or bh < 30:
            continue

        roi = cz[y:y+bh, x:x+bw]
        std_dev = np.std(roi)

        roi_mask = mask[y:y+bh, x:x+bw]
        gray_in_box_ratio = np.sum(roi_mask > 0) / (bw * bh)

        if gray_in_box_ratio > 0.95 and std_dev < 3.0:
            return True, gray_in_box_ratio, std_dev

    return False, 0, 0


def get_png_page_paths(png_dir):
    if not png_dir or not os.path.isdir(png_dir):
        return []

    page_paths = []
    for name in os.listdir(png_dir):
        match = re.fullmatch(r"page_(\d+)\.png", name, re.IGNORECASE)
        if match:
            page_paths.append((int(match.group(1)), os.path.join(png_dir, name)))

    page_paths.sort(key=lambda item: item[0])
    return page_paths


def iter_page_images(pdf_path, png_dir=None):
    png_page_paths = get_png_page_paths(png_dir)
    if png_page_paths:
        print(f"PNG pages detected in [{png_dir}]. Starting image-based error check...")
        for page_num, page_path in png_page_paths:
            image = cv2.imread(page_path)
            if image is None:
                print(f"[Skip] Failed to read page image: {page_path}")
                continue
            yield page_num, cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        return

    if not os.path.exists(pdf_path):
        return

    print(f"Checking [{PDF_FILE_NAME}] via PDF rendering...")
    pages = convert_from_path(pdf_path, dpi=100, poppler_path=POPPLER_BIN_PATH)
    for i, page in enumerate(pages):
        yield i + 1, np.array(page)


def find_error_pages(pdf_path, png_dir=None):
    error_pages = []

    for page_num, img_array in iter_page_images(pdf_path, png_dir):
        is_error, ratio, std = is_loading_error(img_array)

        if is_error:
            print(f"[Error] Page {page_num} flagged (std={std:.2f})")
            error_pages.append(page_num)

    print("-" * 30)
    print(f"Final error pages: {error_pages}")


if __name__ == "__main__":
    find_error_pages(PDF_PATH, USE_PNG_DIR)
