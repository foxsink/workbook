@echo off
cd /d "%~dp0"
echo === Workbook - Docker run ===
echo.

docker --version >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [Error] Docker not found. Install Docker Desktop: https://www.docker.com/products/docker-desktop/
    pause
    exit /b 1
)

echo Starting app + PostgreSQL...
docker compose up --build
pause
