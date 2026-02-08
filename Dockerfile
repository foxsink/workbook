# Build
FROM node:20-alpine AS builder

WORKDIR /app

# Prisma generate needs DATABASE_URL (dummy for build)
ENV DATABASE_URL="postgresql://localhost:5432/dummy"

COPY package.json package-lock.json* ./
RUN npm install

COPY . .
RUN npx prisma generate
RUN npm run build

# Production
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NITRO_HOST=0.0.0.0
ENV NITRO_PORT=3000

# Копируем приложение и Prisma для миграций
COPY --from=builder /app/.output ./
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma.config.ts ./
COPY --from=builder /app/package.json ./
RUN npm install prisma

EXPOSE 3000

CMD sh -c "npx prisma migrate deploy && node server/index.mjs"
