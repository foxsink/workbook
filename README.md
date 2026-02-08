# Workbook

Конспекты по видео и текстовым материалам. Nuxt 4, PostgreSQL, Prisma, Milkdown, Plyr.

## Требования

- **Node.js** 20+
- **Docker** и **Docker Compose** (для PostgreSQL)
- **npm** или pnpm/yarn

## Быстрый старт

### 1. Клонировать и установить зависимости

```bash
git clone <url-репозитория> workbook
cd workbook
npm install
```

### 2. Запустить PostgreSQL

```bash
npm run db:up
# или: docker compose up -d
```

Проверить: `docker compose ps` — контейнер `workbook-db` должен быть в состоянии `running`.

### 3. Настроить переменные окружения

```bash
cp .env.example .env
```

При необходимости отредактируйте `.env` (по умолчанию подходит для docker-compose).

### 4. Применить миграции БД

```bash
npm run db:migrate
# или: npx prisma migrate deploy
```

### 5. Запустить приложение

```bash
npm run dev
```

Приложение доступно на [http://localhost:3000](http://localhost:3000).

## Скрипты

| Команда | Описание |
|---------|----------|
| `npm run dev` | Режим разработки |
| `npm run build` | Сборка для production |
| `npm run preview` | Превью production-сборки |
| `npx prisma migrate deploy` | Применить миграции |
| `npx prisma studio` | Открыть Prisma Studio (GUI для БД) |

## Структура

- **`app/`** — Nuxt/Vue приложение (FSD)
- **`server/`** — API routes
- **`prisma/`** — схема БД и миграции
- **`docker-compose.yml`** — PostgreSQL

## Production

```bash
npm run build
npm run preview  # для проверки
```

Для деплоя потребуется Node.js-хостинг и PostgreSQL. `DATABASE_URL` задаётся в окружении.
