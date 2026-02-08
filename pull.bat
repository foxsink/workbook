@echo off
cd /d "%~dp0"
echo === Pull from GitHub (no git required) ===
echo.

set URL=https://github.com/foxsink/workbook/archive/refs/heads/main.zip
set TEMP_DIR=%TEMP%\workbook-pull
set ZIP=%TEMP_DIR%\main.zip

if exist ".env" (
    echo Backing up .env...
    copy .env .env.backup >nul
)

echo Downloading...
if exist "%TEMP_DIR%" rmdir /s /q "%TEMP_DIR%"
mkdir "%TEMP_DIR%"
powershell -NoProfile -Command "Invoke-WebRequest -Uri '%URL%' -OutFile '%ZIP%' -UseBasicParsing"

if not exist "%ZIP%" (
    echo [Error] Download failed
    pause
    exit /b 1
)

echo Extracting...
powershell -NoProfile -Command "Expand-Archive -Path '%ZIP%' -DestinationPath '%TEMP_DIR%' -Force"

echo Updating files...
xcopy "%TEMP_DIR%\workbook-main\*" "." /E /Y /Q

if exist ".env.backup" (
    copy .env.backup .env >nul
    del .env.backup
    echo Restored .env
)

echo Cleaning up...
rmdir /s /q "%TEMP_DIR%" 2>nul

echo.
echo Done.
pause
