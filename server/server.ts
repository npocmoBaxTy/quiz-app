import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
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

app.listen(env.port, () => {
  console.log(`server started on port ${env.port} (${env.nodeEnv})`)
})
