import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
import fs from "fs"
import path from "path"
import router from "./src/routes/index.js"
import { env } from "./src/config/env.js"
import { UPLOADS_DIR } from "./src/middlewares/upload.js"

const app = express()

// Должно стоять до rate-limit: без этого за прокси все запросы приходят с
// одного IP и лимит на вход становится общим для всех пользователей.
app.set("trust proxy", env.trustProxy)

app.use(cookieParser())

app.use(cors({
  origin: env.corsOrigins,
  credentials: true
}))
app.use(express.json())
app.use("/uploads", express.static(UPLOADS_DIR))

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" })
})
app.use("/api", router)

// --- Раздача собранного клиента ---
// Включается сама, если рядом лежит сборка (CLIENT_DIST). Когда клиент
// живёт на отдельном хостинге, каталога нет и этот блок пропускается.
const CLIENT_DIST = path.resolve(env.clientDist)

if (fs.existsSync(CLIENT_DIST)) {
  // Сначала реальные файлы: /assets/index-*.js, /vite.svg, модели face-api
  app.use(express.static(CLIENT_DIST))

  // SPA-fallback. Прямая ссылка на /login или F5 на /quiz/123 — это обычный
  // GET к серверу, и React в этот момент ещё не запущен: отдельного login.html
  // в сборке нет, поэтому на любой неизвестный путь отвечаем index.html.
  // Дальше бандл загрузится, и react-router сам отрисует нужный экран.
  app.use((req, res, next) => {
    // API и загрузки не подменяем: пусть отдают честный 404
    if (req.method !== "GET" && req.method !== "HEAD") return next()
    if (req.path.startsWith("/api") || req.path.startsWith("/uploads")) return next()

    res.sendFile(path.join(CLIENT_DIST, "index.html"))
  })

  console.log(`serving client from ${CLIENT_DIST}`)
}

app.listen(env.port, () => {
  console.log(`server started on port ${env.port} (${env.nodeEnv})`)
})
