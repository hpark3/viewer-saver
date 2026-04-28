@echo off
@echo off
setlocal
cd /d "%~dp0"

where py >nul 2>nul || (
  echo [SnapDoc] Python 3.10+ is required.
  echo [SnapDoc] Install Python and enable "Add python.exe to PATH", then reopen this window.
  goto :error
)

where node >nul 2>nul || (
  echo [SnapDoc] Node.js 18+ is required.
  echo [SnapDoc] Install Node.js, then reopen this window.
  goto :error
)

where npm >nul 2>nul || (
  echo [SnapDoc] npm is required.
  echo [SnapDoc] Install Node.js, then reopen this window.
  goto :error
)

call :resolve_poppler || goto :error

echo [SnapDoc] Installing Python requirements...
call py -m pip install -r requirements.txt || goto :error

echo [SnapDoc] Installing Playwright Chromium...
call py -m playwright install chromium || goto :error

echo [SnapDoc] Building frontend...
pushd frontend || goto :error
call npm install || goto :error
call npm run build || goto :error
popd

echo.
echo [SnapDoc] Setup complete.
echo [SnapDoc] Starting local server on http://localhost:8000
echo [SnapDoc] Open http://localhost:8000 in your browser after the server starts.
echo [SnapDoc] Keep this window open while using the app.
echo [SnapDoc] Closing this window will stop the local server.
call py server.py
exit /b %errorlevel%

:resolve_poppler
where pdfinfo >nul 2>nul && goto :eof

if exist "C:\poppler\Library\bin\pdfinfo.exe" (
  set "POPPLER_BIN_PATH=C:\poppler\Library\bin"
  echo [SnapDoc] Using Poppler from %POPPLER_BIN_PATH%
  goto :eof
)

if exist "C:\Program Files\poppler\Library\bin\pdfinfo.exe" (
  set "POPPLER_BIN_PATH=C:\Program Files\poppler\Library\bin"
  echo [SnapDoc] Using Poppler from %POPPLER_BIN_PATH%
  goto :eof
)

if exist "C:\Program Files (x86)\poppler\Library\bin\pdfinfo.exe" (
  set "POPPLER_BIN_PATH=C:\Program Files (x86)\poppler\Library\bin"
  echo [SnapDoc] Using Poppler from %POPPLER_BIN_PATH%
  goto :eof
)

echo [SnapDoc] Poppler for Windows is required for Stage 2 page previews.
echo [SnapDoc] Install Poppler and add its Library\bin folder to PATH,
echo [SnapDoc] or set POPPLER_BIN_PATH before running this script.
exit /b 1

:error
echo.
echo [SnapDoc] Setup failed. Please review the messages above.
pause
exit /b 1
