# Контекст сборки — каталог client/:
#   docker build -f docker/client.Dockerfile --build-arg VITE_API_URL=https://api.example.com -t quiz-client ./client

FROM node:22-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# Vite подставляет переменную в бандл на этапе сборки, менять её в рантайме
# уже нельзя — под каждый домен API нужен свой образ.
ARG VITE_API_URL=http://localhost:5000
ENV VITE_API_URL=$VITE_API_URL
RUN npm run build


FROM nginx:1.27-alpine AS runtime
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
