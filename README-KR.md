# ViewerSaver

<br>
<br>

<p align="center">
  <img src="frontend/src/assets/branding/logo-icon+text-light.png" alt="ViewerSaver" width="320" />
</p>

<p align="center">
  <strong>로컬 환경에서 브라우저 전용 문서를 PDF로 저장하는 도구입니다.</strong>
</p>

<p align="center">
  <a href="#빠른-시작"><img src="https://img.shields.io/badge/build-passing-22c55e" alt="Build"></a>
  <a href="#요구-사항"><img src="https://img.shields.io/badge/python-3.10%2B-3776ab?logo=python&logoColor=white" alt="Python"></a>
  <a href="#라이선스"><img src="https://img.shields.io/badge/license-AGPL--3.0-black" alt="License"></a>
  <a href="https://viewer-saver.vercel.app"><img src="https://img.shields.io/badge/demo-live-0ea5e9" alt="Demo"></a>
</p>

<p align="center">
  <a href="README.md">English README</a> | 한국어
</p>

## 개요

ViewerSaver는 Canva, 슬라이드 뷰어처럼 브라우저 안에서만 접근 가능한 문서를 로컬 PC에서 PDF로 저장할 수 있게 도와줍니다. 실제 캡처는 로컬 Playwright 실행을 기준으로 설계되어 있고, 공개 데모는 전체 런타임을 노출하지 않고 인터페이스만 확인할 수 있도록 분리되어 있습니다.

현재 제한 사항:

- 브라우저 자동화가 필요하므로 클라우드 전용 배포에서는 실제 캡처를 지원하지 않습니다.
- 기본 사용 흐름은 로컬 실행 기준으로 설계되어 있습니다.
- Windows를 주 개발 환경으로 두고 있으며, macOS와 Linux는 best-effort 지원입니다.

## 라이브 데모

- Try it online: [https://viewer-saver.vercel.app](https://viewer-saver.vercel.app)
- 저장소: [https://github.com/hpark3/viewer-saver](https://github.com/hpark3/viewer-saver)

> 기존 `snapdoc-demo.vercel.app` 링크는 자동으로 이 주소로 연결됩니다. 저장해둔 북마크는 그대로 사용할 수 있습니다.
- 참고: 배포된 데모는 mocked response 기반 UI 미리보기용입니다.

## 동작 방식

1. ViewerSaver가 Playwright Chromium으로 대상 문서를 로컬에서 엽니다.
2. 페이지를 캡처한 뒤 미리보기와 오류 검토 단계를 통해 문제가 있는 페이지를 확인합니다.
3. 검토 또는 교체가 끝난 결과를 최종 PDF로 묶어 저장합니다.

[readme-1.webm](https://github.com/user-attachments/assets/5aecbed8-7cfb-49fd-9efd-f4a23380a2f0)

[readme-2.webm](https://github.com/user-attachments/assets/2214ba6f-6fa3-41fe-b7e3-9dd2f11e2bc5)

<br>

## 요구 사항

- Python 3.10+ 권장 (`3.9`는 Windows 의존성 설치에서 실패할 수 있습니다)
- Node.js 18+
- Playwright Chromium
- Poppler for Windows (Windows에서 Stage 2 페이지 미리보기에 필요)

Windows에서는 설치를 시작하기 전에 Python을 먼저 설치해야 합니다.
Python 설치 중에는 `Add python.exe to PATH` 옵션을 켜 주세요.
설치 후 PowerShell 또는 Command Prompt에서 `py --version`으로 확인할 수 있습니다.
Windows에서는 `python`보다 `py` 명령을 사용하는 편이 더 안전합니다. macOS와 Linux에서는 `python3`를 사용해 주세요.

## 기술 스택

| 계층       | 기술                                           |
| ---------- | ---------------------------------------------- |
| Frontend   | Vite 6 + React 19 + TypeScript + TailwindCSS 4 |
| Animation  | motion (framer-motion v12)                     |
| Backend    | FastAPI + uvicorn (Python)                     |
| PDF Engine | Playwright + pypdf + pdf2image                 |

## 설치 가이드

바로가기: [원클릭 설치 (Windows 전용)](#one-click-setup-windows-only) | [Windows 처음 설치 가이드](#windows-first-time-setup) | [빠른 시작 (macOS / Linux / 터미널 익숙한 사용자)](#quick-start)

<a id="one-click-setup-windows-only"></a>

## 원클릭 설치 (Windows 전용)

Windows를 사용 중이고 가장 쉬운 로컬 실행 경로가 필요하다면 이 방법부터 시작하세요.
이 방법은 Python, Node.js, Poppler가 이미 설치된 Windows PC에서 가장 쉽게 실행할 수 있는 방법입니다.
새 PC에서 처음 설치하는 경우에는 [Windows 처음 설치 가이드](#windows-first-time-setup)부터 보세요.

### 방법 A: PowerShell 또는 Command Prompt에 그대로 붙여넣기

1. `Windows PowerShell` 또는 `명령 프롬프트(Command Prompt)`를 엽니다.
2. 시작 메뉴에서 `PowerShell` 또는 `cmd`를 검색해서 열 수 있습니다.
3. 아래 명령을 한 줄씩 그대로 붙여넣고, 각 줄마다 Enter를 누릅니다.

Windows PowerShell을 사용 중이라면:

```powershell
git clone https://github.com/hpark3/viewer-saver.git
cd viewer-saver
.\run.bat
```

명령 프롬프트(Command Prompt)를 사용 중이라면:

```bat
git clone https://github.com/hpark3/viewer-saver.git
cd viewer-saver
run.bat
```

4. 설치가 진행되는 동안 검은 창이 열려 있습니다.
5. 설치가 끝나면 브라우저에서 `http://localhost:8000`을 엽니다.
6. 앱을 사용하는 동안에는 그 창을 닫지 마세요. 창을 닫으면 로컬 서버도 함께 종료됩니다.

### 방법 B: 파일로 내려받아서 `run.bat` 실행

1. 브라우저에서 GitHub 저장소 페이지를 엽니다.
2. 초록색 `Code` 버튼을 누릅니다.
3. `Download ZIP`을 누릅니다.
4. ZIP 파일의 압축을 풉니다.
5. 압축을 푼 폴더를 엽니다.
6. `run.bat`를 더블클릭합니다.
7. 설치가 끝나면 브라우저에서 `http://localhost:8000`을 엽니다.
8. 앱을 사용하는 동안에는 `run.bat` 창을 닫지 마세요.

`run.bat`는 필요한 의존성을 설치하고, 프런트엔드를 빌드한 뒤, 로컬 앱을 실행합니다.
이 사용자용 실행 방식에서는 `npm run dev`를 따로 실행할 필요가 없습니다.

<a id="windows-first-time-setup"></a>

## Windows 처음 설치 가이드

Windows를 사용 중이고, 이 PC에서 Python 프로젝트를 처음 실행한다면 이 섹션부터 따라가세요.

1. Windows에 Python 3.10 이상을 설치합니다.
2. 설치 과정에서 `Add python.exe to PATH` 옵션을 켭니다.
3. Poppler for Windows를 설치하고 `Library\bin` 폴더를 PATH에 추가합니다.
4. 설치가 끝나면 PowerShell 또는 Command Prompt를 새로 엽니다.
5. Python이 설치되었는지 확인합니다.

```powershell
py --version
```

위 명령이 동작하지 않으면 아래도 확인해 보세요.

```powershell
python --version
```

둘 다 동작하지 않으면 Python이 아직 설치되지 않았거나, 설치 후 터미널을 다시 열지 않은 상태입니다.

6. Node.js가 설치되어 있는지 확인합니다.

```powershell
node --version
```

`node` 명령이 인식되지 않으면 Node.js 18 이상을 먼저 설치한 뒤 계속 진행해 주세요.

7. Poppler가 설치되어 있는지 확인합니다.

```powershell
where pdfinfo
```

`pdfinfo`를 찾지 못하면 Poppler for Windows를 설치하고 `Library\bin` 폴더를 PATH에 추가하거나, 해당 폴더를 `POPPLER_BIN_PATH`로 지정해 주세요.

8. 아래 순서대로 전체 설치를 진행합니다.

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

9. 브라우저에서 `http://localhost:8000`을 엽니다.

<a id="quick-start"></a>

## 빠른 시작 (macOS / Linux / 터미널 익숙한 사용자)

macOS 또는 Linux 사용자이거나, 운영체제와 관계없이 터미널 명령 실행이 익숙하다면 이 경로를 사용하세요.
이 경로는 브라우저 진입점을 `http://localhost:8000` 하나로 맞춘 전체 로컬 실행용입니다.
`npm run build` 이후에는 백엔드가 빌드된 프런트엔드 번들을 함께 서빙합니다.

### Windows

Windows PowerShell 또는 Command Prompt에서 실행할 수 있습니다.
`pip` 또는 `python` 명령이 인식되지 않으면 Python 3.10+를 먼저 설치하고 터미널을 다시 열어 주세요.

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

브라우저에서 `http://localhost:8000`을 엽니다.

### macOS / Linux

```bash
git clone https://github.com/hpark3/viewer-saver.git
cd viewer-saver
python3 -m pip install -r requirements.txt
python3 -m playwright install chromium
cd frontend && npm install && npm run build && cd ..
python3 server.py
```

브라우저에서 `http://localhost:8000`을 엽니다.

프런트엔드 핫리로드와 기여자용 로컬 개발 안내는 [.github/CONTRIBUTING-KR.md](.github/CONTRIBUTING-KR.md)에서 확인할 수 있습니다.

## 사용 방법

1. `http://localhost:8000`을 엽니다.
2. 캡처할 문서 URL을 붙여넣습니다.
3. Fast 또는 Quality 모드를 선택합니다.
4. 캡처 후 감지된 오류 페이지를 검토합니다.
5. 재캡처 또는 수정본 업로드 후 최종 PDF를 저장합니다.

## 임시 파일

ViewerSaver는 서버가 시작될 때와 종료될 때 `output/temp/` 및 `output/previews/`의 임시 파일을 자동으로 정리합니다.

서버를 오랫동안 계속 실행하는 경우에는 이 폴더들을 가끔 수동으로 정리해 주는 것이 좋습니다.

## 문서 안내

- [README.md](README.md) - 영어 기본 안내 문서입니다.
- [.github/CONTRIBUTING-KR.md](.github/CONTRIBUTING-KR.md) - 한국어 기여 가이드입니다.
- [.github/CONTRIBUTING.md](.github/CONTRIBUTING.md) - 영어 기여 가이드와 로컬 개발 안내입니다.

## 기여 및 지원

버그 수정, 문서 개선, 작은 UX 다듬기까지 어떤 크기의 기여든 환영합니다.
로컬 실행 방법과 기여 절차는 [.github/CONTRIBUTING-KR.md](.github/CONTRIBUTING-KR.md)에서 먼저 확인해 주세요.

버그, 기능 요청, 또는 먼저 논의가 필요한 비교적 큰 변경은 GitHub `Issues`로 열어 주세요.
범위가 명확한 수정, 문서 업데이트, 잘게 나뉜 개선은 바로 `Pull Request`로 보내 주셔도 좋습니다.
질문, 초기 아이디어, 아직 방향을 함께 잡아야 하는 내용은 `Discussions`를 사용해 주세요.

## 라이선스

GNU Affero General Public License v3.0
