# ViewerSaver

> Browser-only document capture for local use.

[![Build](https://img.shields.io/badge/build-passing-22c55e)](#quick-start)
[![Python](https://img.shields.io/badge/python-3.10%2B-3776ab?logo=python&logoColor=white)](#requirements)
[![License](https://img.shields.io/badge/license-AGPL--3.0-black)](#license)
[![Demo](https://img.shields.io/badge/demo-live-0ea5e9)](https://snapdoc-demo.vercel.app)

English | [한국어 README](README-KR.md)

## Overview

ViewerSaver saves browser-only documents such as Canva and slide viewers to PDF on your own machine.

> Branding note: `ViewerSaver` is the current official product name. `SnapDoc` may still appear in older links, demo surfaces, or in-progress branding updates while the transition is being completed.

Current limits:
- Real capture is not supported in cloud-only deployment because browser automation is required.
- The main workflow is designed for local execution.
- Windows is the primary development environment; macOS and Linux are best-effort.

## Live Demo

- Try it online: [https://snapdoc-demo.vercel.app](https://snapdoc-demo.vercel.app)
- Repository: [https://github.com/hpark3/viewer-saver](https://github.com/hpark3/viewer-saver)

## How It Works

1. ViewerSaver opens the target document in Playwright Chromium and captures pages locally.
2. The app surfaces preview and error-review steps so you can check failed or suspicious pages.
3. Final output is assembled into a PDF for download after review or replacement.

[readme-1.webm](https://github.com/user-attachments/assets/5aecbed8-7cfb-49fd-9efd-f4a23380a2f0)

[readme-2.webm](https://github.com/user-attachments/assets/2214ba6f-6fa3-41fe-b7e3-9dd2f11e2bc5)

<br>

## Requirements

- Python 3.10+ recommended (`3.9` may fail on Windows dependency installs)
- Node.js 18+
- Playwright Chromium
- Poppler for Windows (required on Windows for Stage 2 page previews)

On Windows, install Python before starting the setup.
During Python installation, enable `Add python.exe to PATH`.
You can confirm the install in PowerShell or Command Prompt with `py --version`.
On Windows, prefer `py` commands instead of `python`. On macOS and Linux, use `python3`.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Vite 6 + React 19 + TypeScript + TailwindCSS 4 |
| Animation | motion (framer-motion v12) |
| Backend | FastAPI + uvicorn (Python) |
| PDF Engine | Playwright + pypdf + pdf2image |

## Installation Guide

Choose your path: [One-Click Setup (Windows only)](#one-click-setup-windows-only) | [Windows First-Time Setup](#windows-first-time-setup) | [Quick Start (macOS / Linux / advanced users)](#quick-start)

<a id="one-click-setup-windows-only"></a>
## One-Click Setup (Windows only)

Use this if you are on Windows and want the easiest local setup path.
This is the simplest way to run the app after Python, Node.js, and Poppler are already installed.
If this is a brand-new PC, start with [Windows First-Time Setup](#windows-first-time-setup).

### Option A: Paste commands into PowerShell or Command Prompt

1. Open Windows PowerShell or Command Prompt.
2. You can open either one from the Start menu by searching for `PowerShell` or `cmd`.
3. Copy and paste these commands one line at a time, then press Enter after each line.

If you are using Windows PowerShell:

```powershell
git clone https://github.com/hpark3/viewer-saver.git
cd viewer-saver
.\run.bat
```

If you are using Command Prompt:

```bat
git clone https://github.com/hpark3/viewer-saver.git
cd viewer-saver
run.bat
```

4. A black terminal window will stay open while setup runs.
5. When setup finishes, open `http://localhost:8000` in your browser.
6. Keep that window open while using the app. If you close it, the local server stops.

### Option B: Download the project and double-click `run.bat`

1. Open the GitHub repository page in your browser.
2. Click the green `Code` button.
3. Click `Download ZIP`.
4. Extract the ZIP file.
5. Open the extracted folder.
6. Double-click `run.bat`.
7. When setup finishes, open `http://localhost:8000` in your browser.
8. Keep the `run.bat` window open while using the app.

`run.bat` installs the required dependencies, builds the frontend, and starts the local app for you.
You do not need to run `npm run dev` for this user-style local launch.

<a id="windows-first-time-setup"></a>
## Windows First-Time Setup

Use this if you are on Windows and this PC has never been used for Python projects before.

1. Install Python 3.10 or newer on Windows.
2. During the installer, enable `Add python.exe to PATH`.
3. Install Poppler for Windows and add its `Library\bin` folder to PATH.
4. Open a new PowerShell or Command Prompt window.
5. Check that Python is installed:

```powershell
py --version
```

If that does not work, try:

```powershell
python --version
```

If neither command works, Python is not installed yet or the terminal needs to be reopened after installation.

6. Check that Node.js is installed:

```powershell
node --version
```

If `node` is not recognized, install Node.js 18 or newer before continuing.

7. Check that Poppler is installed:

```powershell
where pdfinfo
```

If `pdfinfo` is not found, install Poppler for Windows and add its `Library\bin` folder to PATH, or set `POPPLER_BIN_PATH` to that folder.

8. Run the full setup step by step:

```powershell
git clone https://github.com/hpark3/viewer-saver.git
cd viewer-saver
py -m pip install -r requirements.txt
py -m playwright install chromium
cd frontend
npm install
npm run build
cd ..
py server.py
```

9. Open `http://localhost:8000`.

<a id="quick-start"></a>
## Quick Start

Use this if you are on macOS or Linux, or if you are comfortable running terminal commands yourself.
This path is for the full local app with one browser entry at `http://localhost:8000`.
The backend serves the built frontend bundle after `npm run build`.

### Windows

Use Windows PowerShell or Command Prompt.
If `pip` or `python` is not recognized, install Python 3.10+ first and reopen the terminal.

```powershell
git clone https://github.com/hpark3/viewer-saver.git
cd viewer-saver
py -m pip install -r requirements.txt
py -m playwright install chromium
cd frontend
npm install
npm run build
cd ..
py server.py
```

Open `http://localhost:8000`.

### macOS / Linux

```bash
git clone https://github.com/hpark3/viewer-saver.git
cd viewer-saver
python3 -m pip install -r requirements.txt
python3 -m playwright install chromium
cd frontend && npm install && npm run build && cd ..
python3 server.py
```

Open `http://localhost:8000`.

Frontend hot reload and contributor-focused local development notes live in [.github/CONTRIBUTING.md](.github/CONTRIBUTING.md).

## Usage

1. Open `http://localhost:8000`.
2. Paste the document URL you want to capture.
3. Choose Fast or Quality mode.
4. Review detected error pages after capture.
5. Re-capture or upload fixes, then save the final PDF.

## Documentation

- [README-KR.md](README-KR.md) - Korean guide for local setup and usage.
- [.github/CONTRIBUTING.md](.github/CONTRIBUTING.md) - Contribution workflow and local development notes.
- [.github/CONTRIBUTING-KR.md](.github/CONTRIBUTING-KR.md) - Korean contribution guide.

## Contributing & Support

We welcome contributions of all sizes, including bug fixes, documentation improvements, and small UX polish.
Please start with [.github/CONTRIBUTING.md](.github/CONTRIBUTING.md) for local setup and contribution guidelines.

Open a GitHub `Issue` for bugs, feature requests, or larger changes you want to discuss first.
Open a `Pull Request` for focused fixes, documentation updates, or well-scoped improvements.
Use `Discussions` for questions, early ideas, or anything still exploratory.

## License

GNU Affero General Public License v3.0
