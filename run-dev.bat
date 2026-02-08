@echo off
cd /d "%~dp0"
echo === Workbook - Dev mode ===
echo.

node --version >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [Error] Node.js not found. Install Node.js 20+: https://nodejs.org/
    pause
    exit /b 1
)

docker --version >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [Error] Docker not found. Install Docker Desktop: https://www.docker.com/products/docker-desktop/
    pause
    exit /b 1
)

if not exist "node_modules" (
    echo [1/5] npm install...
    call npm install
) else (
    echo [1/5] node_modules OK
)

echo [2/5] Starting PostgreSQL...
docker compose up -d postgres
timeout /t 3 /nobreak >nul

if not exist ".env" (
    echo [3/5] Creating .env...
    copy .env.example .env >nul
) else (
    echo [3/5] .env OK
)

echo [4/5] Running migrations...
call npx prisma migrate deploy

echo [5/5] Starting dev server...
echo.
echo App: http://localhost:3000
echo.
call npm run dev
pause
