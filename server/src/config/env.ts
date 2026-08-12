import dotenv from "dotenv"

dotenv.config()

/**
 * Обязательные переменные проверяем на старте, а не в момент первого запроса:
 * иначе сервер поднимется «здоровым» и упадёт только когда кто-то попробует
 * залогиниться.
 */
function required(name: string): string {
  const value = process.env[name]
  if (!value) {
    throw new Error(
      `Не задана обязательная переменная окружения ${name}. Список всех переменных — в server/.env.example`,
    )
  }
  return value
}

function parsePort(raw: string | undefined): number {
  if (!raw) return 5000
  const port = Number(raw)
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error(`PORT должен быть числом от 1 до 65535, получено: ${raw}`)
  }
  return port
}

/**
 * За реверс-прокси (nginx, Render, Railway, Fly) express должен доверять
 * X-Forwarded-For, иначе express-rate-limit увидит один IP прокси на всех
 * пользователей и лимит станет общим. Значение — число хопов до клиента.
 */
function parseTrustProxy(raw: string | undefined): number | boolean {
  if (!raw) return false
  if (raw === "true") return true
  if (raw === "false") return false
  const hops = Number(raw)
  if (!Number.isInteger(hops) || hops < 0) {
    throw new Error(`TRUST_PROXY должен быть true, false или числом хопов, получено: ${raw}`)
  }
  return hops
}

const nodeEnv = process.env.NODE_ENV ?? "development"

export const env = {
  nodeEnv,
  isProduction: nodeEnv === "production",
  port: parsePort(process.env.PORT),
  databaseUrl: required("DATABASE_URL"),
  /** Supabase и большинство managed-баз требуют SSL; локальный postgres — нет. */
  databaseSsl: (process.env.DATABASE_SSL ?? "true") !== "false",
  jwtSecret: required("JWT_SECRET"),
  refreshSecret: required("REFRESH_SECRET"),
  /** Список origin через запятую: прод-домен, превью-домен, локальный dev. */
  corsOrigins: (process.env.CORS_ORIGIN ?? "http://localhost:5173")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean),
  trustProxy: parseTrustProxy(process.env.TRUST_PROXY),
  /** Каталог загрузок относительно рабочей директории процесса. */
  uploadsDir: process.env.UPLOADS_DIR ?? "uploads",
  /**
   * Каталог со собранным клиентом. Если он существует, сервер раздаёт SPA
   * сам; если нет — работает только как API, и статику отдаёт кто-то другой.
   */
  clientDist: process.env.CLIENT_DIST ?? "client-dist",
  /** Необязательный: без него роут AI-генерации отвечает понятной ошибкой. */
  geminiApiKey: process.env.GEMINI_API_KEY ?? "",
}
