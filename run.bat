@echo off
@echo off
setlocal
cd /d "%~dp0"

where py >nul 2>nul || (
  echo [ViewerSaver] Python 3.10+ is required.
  echo [ViewerSaver] Install Python and enable "Add python.exe to PATH", then reopen this window.
  goto :error
)

where node >nul 2>nul || (
  echo [ViewerSaver] Node.js 18+ is required.
  echo [ViewerSaver] Install Node.js, then reopen this window.
  goto :error
)

where npm >nul 2>nul || (
  echo [ViewerSaver] npm is required.
  echo [ViewerSaver] Install Node.js, then reopen this window.
  goto :error
)

call :resolve_poppler || goto :error

echo [ViewerSaver] Installing Python requirements...
call py -m pip install -r requirements.txt || goto :error

echo [ViewerSaver] Installing Playwright Chromium...
call py -m playwright install chromium || goto :error

echo [ViewerSaver] Building frontend...
pushd frontend || goto :error
call npm install || goto :error
call npm run build || goto :error
popd

echo.
echo [ViewerSaver] Setup complete.
echo [ViewerSaver] Starting local server on http://localhost:8000
echo [ViewerSaver] Open http://localhost:8000 in your browser after the server starts.
echo [ViewerSaver] Keep this window open while using the app.
echo [ViewerSaver] Closing this window will stop the local server.
call py backend/server.py
exit /b %errorlevel%

:resolve_poppler
where pdfinfo >nul 2>nul && goto :eof

if exist "C:\poppler\Library\bin\pdfinfo.exe" (
  set "POPPLER_BIN_PATH=C:\poppler\Library\bin"
  echo [ViewerSaver] Using Poppler from %POPPLER_BIN_PATH%
  goto :eof
)

if exist "C:\Program Files\poppler\Library\bin\pdfinfo.exe" (
  set "POPPLER_BIN_PATH=C:\Program Files\poppler\Library\bin"
  echo [ViewerSaver] Using Poppler from %POPPLER_BIN_PATH%
  goto :eof
)

if exist "C:\Program Files (x86)\poppler\Library\bin\pdfinfo.exe" (
  set "POPPLER_BIN_PATH=C:\Program Files (x86)\poppler\Library\bin"
  echo [ViewerSaver] Using Poppler from %POPPLER_BIN_PATH%
  goto :eof
)

echo [ViewerSaver] Poppler for Windows is required for Stage 2 page previews.
echo [ViewerSaver] Install Poppler and add its Library\bin folder to PATH,
echo [ViewerSaver] or set POPPLER_BIN_PATH before running this script.
exit /b 1

:error
echo.
echo [ViewerSaver] Setup failed. Please review the messages above.
pause
exit /b 1
