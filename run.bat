@echo off
chcp 65001 >nul
echo === Workbook - локальный запуск (Windows) ===
echo.

REM Проверка Docker
docker --version >nul 2>&1
if errorlevel 1 (
    echo [Ошибка] Docker не найден. Установите Docker Desktop: https://www.docker.com/products/docker-desktop/
    pause
    exit /b 1
)

REM Вариант A: только Docker (без npm)
echo Вариант A: Docker (приложение + БД)
echo.
docker compose up --build
pause
