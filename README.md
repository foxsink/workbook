# Workbook

Конспекты по видео и текстовым материалам. Nuxt 4, PostgreSQL, Prisma, Milkdown, Plyr.

## Требования

- **Node.js** 20+ и **npm** — для локальной разработки
- **Docker** и **Docker Compose** — для запуска (в т.ч. без Node.js)

## Windows: быстрый запуск

После клонирования запустите в папке проекта:

| Режим | Скрипт | Требования |
|-------|--------|------------|
| Только Docker | `run.bat` | Docker Desktop |
| Локальная разработка | `run-dev.bat` | Node.js 20+ и Docker Desktop |

Оба скрипта проверяют наличие нужных программ и выводят подсказки при ошибках.

## Вариант A: Только Docker (без npm)

Подходит, если Node.js не установлен. Нужны только Docker и Docker Compose.

```bash
git clone <url-репозитория> workbook
cd workbook
docker compose up --build
```

**Windows (cmd):**
```cmd
git clone <url-репозитория> workbook
cd workbook
run.bat
```

Приложение: [http://localhost:3000](http://localhost:3000). Миграции применяются при старте.

## Вариант B: Локальная разработка

### 1. Установить зависимости

```bash
git clone <url-репозитория> workbook
cd workbook
npm install
```

### 2. Запустить PostgreSQL

```bash
npm run db:up
# или: docker compose up -d postgres
```

### 3. Настроить переменные окружения

```bash
cp .env.example .env
```
Windows (cmd): `copy .env.example .env`

### 4. Применить миграции БД

```bash
npm run db:migrate
```

### 5. Запустить приложение

```bash
npm run dev
```

Приложение: [http://localhost:3000](http://localhost:3000).

**Windows (cmd):**
```cmd
git clone <url-репозитория> workbook
cd workbook
run-dev.bat
```

Скрипт установит зависимости, запустит PostgreSQL, создаст `.env` и применит миграции.

## Скрипты

| Команда | Описание |
|---------|----------|
| `npm run dev` | Режим разработки |
| `npm run build` | Сборка для production |
| `npm run preview` | Превью production-сборки |
| `npm run db:up` | Запустить PostgreSQL (Docker) |
| `npm run db:migrate` | Применить миграции БД |
| `npx prisma studio` | Открыть Prisma Studio (GUI для БД) |

## Структура

- **`app/`** — Nuxt/Vue приложение (FSD)
- **`server/`** — API routes
- **`prisma/`** — схема БД и миграции
- **`Dockerfile`** — образ приложения
- **`docker-compose.yml`** — PostgreSQL + приложение

## Production

**Docker:** `docker compose up --build` — сразу production-сборка.

**Без Docker:** `npm run build && npm run preview`. Нужны Node.js и PostgreSQL. `DATABASE_URL` задаётся в окружении.
