@echo off
chcp 65001 >nul
echo === Workbook - локальная разработка (Windows) ===
echo.

REM Проверка Node.js
node --version >nul 2>&1
if errorlevel 1 (
    echo [Ошибка] Node.js не найден. Установите Node.js 20+: https://nodejs.org/
    pause
    exit /b 1
)

REM Проверка Docker
docker --version >nul 2>&1
if errorlevel 1 (
    echo [Ошибка] Docker не найден. Установите Docker Desktop: https://www.docker.com/products/docker-desktop/
    pause
    exit /b 1
)

REM 1. Зависимости
if not exist "node_modules" (
    echo [1/5] Установка зависимостей...
    call npm install
) else (
    echo [1/5] node_modules уже есть
)

REM 2. PostgreSQL
echo [2/5] Запуск PostgreSQL...
docker compose up -d postgres
timeout /t 3 /nobreak >nul

REM 3. .env
if not exist ".env" (
    echo [3/5] Создание .env из .env.example...
    copy .env.example .env >nul
) else (
    echo [3/5] .env уже есть
)

REM 4. Миграции
echo [4/5] Применение миграций...
call npx prisma migrate deploy

REM 5. Запуск
echo [5/5] Запуск dev-сервера...
echo.
echo Приложение: http://localhost:3000
echo.
call npm run dev
pause
