# Quiz App

Платформа для создания и прохождения тестов: React + Vite на фронтенде,
Express + Prisma (PostgreSQL) на бэкенде.

```
client/   SPA на React 19, Vite, Tailwind
server/   REST API на Express 5, Prisma 7, JWT в httpOnly-куках
docker/   Dockerfile'ы и compose для деплоя
```

## Локальный запуск

Нужен Node.js 22+ и доступ к PostgreSQL.

```bash
# сервер
cd server
cp .env.example .env      # заполните DATABASE_URL, DIRECT_URL, секреты
npm install
npm run prisma:generate
npm run prisma:deploy     # применить миграции
npm run dev               # http://localhost:5000

# клиент
cd client
cp .env.example .env
npm install
npm run dev               # http://localhost:5173
```

Секреты генерируются, например, так: `openssl rand -base64 48`.
Сервер намеренно падает на старте, если `DATABASE_URL`, `JWT_SECRET` или
`REFRESH_SECRET` не заданы.

## Переменные окружения

Полный список с комментариями — в `server/.env.example` и `client/.env.example`.
Ключевое при деплое:

| Переменная | Где | Зачем |
| --- | --- | --- |
| `DATABASE_URL` | server | Подключение приложения к базе (пулер) |
| `DIRECT_URL` | server | Прямое подключение для Prisma CLI и миграций |
| `JWT_SECRET`, `REFRESH_SECRET` | server | Подпись access/refresh-токенов |
| `CORS_ORIGIN` | server | Домены фронтенда через запятую |
| `TRUST_PROXY` | server | Число прокси до клиента; без него rate-limit считает всех за один IP |
| `VITE_API_URL` | client | Адрес API, **вшивается в бандл на этапе сборки** |

## Сборка

```bash
cd server && npm run build && npm start   # prisma generate + tsc -> dist/server.js
cd client && npm run build                # -> client/dist, раздаётся как статика
```

## Docker

```bash
# из корня репозитория
docker compose -f docker/docker-compose.yml up --build
# клиент: http://localhost:8080, API: http://localhost:5000
```

`VITE_API_URL` подставляется в бандл во время сборки образа, поэтому для
другого домена API образ клиента нужно пересобрать:

```bash
VITE_API_URL=https://api.example.com docker compose -f docker/docker-compose.yml build client
```

## Деплой: что важно не забыть

1. **Миграции** применяются отдельным шагом, в образ они не зашиты:
   `DIRECT_URL=... npm run prisma:deploy`.
2. **`TRUST_PROXY`** обязателен за nginx / Render / Railway, иначе лимит
   попыток входа станет общим на всех пользователей.
3. **Загруженные картинки** лежат на диске сервера (`UPLOADS_DIR`, по умолчанию
   `server/uploads`) и раздаются с `/uploads`. На платформах с эфемерной ФС
   каталог нужно смонтировать как постоянный том — в compose это том `uploads`.
4. **Куки** ставятся с `secure`/`sameSite` в зависимости от `NODE_ENV`, так что
   в проде фронтенд и API должны работать по HTTPS.
5. **`GEMINI_API_KEY`** необязателен: без него работает всё, кроме
   AI-генерации вопросов, которая вернёт понятную ошибку.
