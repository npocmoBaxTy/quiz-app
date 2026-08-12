# Контекст сборки — КОРЕНЬ репозитория, а не server/:
#   docker build -f docker/server.Dockerfile -t quiz-server .
#
# Так на хостингах не нужно отдельно настраивать build context — корень
# и так дефолт. Цена — префикс server/ у всех путей ниже.

# --- Сборка клиента ---
FROM node:22-alpine AS client-build
WORKDIR /app

COPY client/package.json client/package-lock.json ./
RUN npm ci

COPY client/ ./

# Пусто по умолчанию = запросы уходят на тот же origin, что и страница.
# Именно это нужно, когда клиент и API отдаёт один контейнер: CORS и
# междоменные куки не задействованы вовсе.
# Для раздельного хостинга передайте адрес API:
#   docker build --build-arg VITE_API_URL=https://api.example.com ...
ARG VITE_API_URL=""
ENV VITE_API_URL=$VITE_API_URL
RUN npm run build


# --- Сборка сервера ---
FROM node:22-alpine AS build
WORKDIR /app

COPY server/package.json server/package-lock.json ./
RUN npm ci

COPY server/ ./

# prisma generate читает prisma.config.ts, который требует DIRECT_URL.
# К базе на этапе сборки не подключаемся — достаточно любого валидного значения.
ENV DIRECT_URL=postgresql://placeholder:placeholder@localhost:5432/placeholder
RUN npm run build


FROM node:22-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production

COPY server/package.json server/package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

# Сгенерированный Prisma-клиент компилируется вместе с исходниками,
# поэтому в dist/ уже лежит всё нужное для рантайма.
COPY --from=build /app/dist ./dist

# Нужно entrypoint'у: `prisma migrate deploy` читает конфиг и историю миграций.
# Сам CLI лежит в dependencies, поэтому переживает `npm ci --omit=dev`.
COPY server/prisma ./prisma
COPY server/prisma.config.ts ./
COPY server/docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

# Собранный клиент. server.ts подхватывает каталог сам (CLIENT_DIST,
# по умолчанию ./client-dist) и отдаёт SPA с fallback на index.html.
COPY --from=client-build /app/dist ./client-dist

# Загруженные картинки лежат на диске — том обязателен, иначе они
# исчезнут при пересоздании контейнера.
RUN mkdir -p /app/uploads && chown -R node:node /app/uploads
VOLUME ["/app/uploads"]

USER node
EXPOSE 5000
ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["node", "dist/server.js"]
