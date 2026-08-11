# Контекст сборки — каталог server/:
#   docker build -f docker/server.Dockerfile -t quiz-server ./server

FROM node:22-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# prisma generate читает prisma.config.ts, который требует DIRECT_URL.
# К базе на этапе сборки не подключаемся — достаточно любого валидного значения.
ENV DIRECT_URL=postgresql://placeholder:placeholder@localhost:5432/placeholder
RUN npm run build


FROM node:22-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production

COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

# Сгенерированный Prisma-клиент компилируется вместе с исходниками,
# поэтому в dist/ уже лежит всё нужное для рантайма.
COPY --from=build /app/dist ./dist

# Загруженные картинки лежат на диске — том обязателен, иначе они
# исчезнут при пересоздании контейнера.
RUN mkdir -p /app/uploads && chown -R node:node /app/uploads
VOLUME ["/app/uploads"]

USER node
EXPOSE 5000
CMD ["node", "dist/server.js"]
