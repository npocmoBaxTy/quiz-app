import rateLimit, { ipKeyGenerator } from "express-rate-limit";

// ВАЖНО: за реверс-прокси (nginx, Render, Railway и т.п.) без
// app.set("trust proxy", 1) все запросы придут с одного IP и лимит станет
// общим на всех. При деплое за прокси это нужно включить в server.js.

/**
 * Подбор пароля. Считаем только неудачные попытки — успешный вход
 * лимит не тратит, поэтому обычный пользователь его не почувствует.
 */
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  skipSuccessfulRequests: true,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: {
    error: "Слишком много попыток входа. Попробуйте через 15 минут.",
  },
});

/** Массовая регистрация аккаунтов с одного адреса */
export const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 5,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: {
    error: "Слишком много регистраций. Попробуйте позже.",
  },
});

/** Перебор refresh-токенов */
export const refreshLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 60,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { error: "Слишком много запросов. Попробуйте позже." },
});

/**
 * Перебор текущего пароля через смену пароля: роут просит currentPassword,
 * так что угнанной сессии его хватило бы для подбора исходного пароля.
 * Ключ — пользователь, а не IP: запрос уже прошёл authMiddleware, а один
 * внешний адрес делит на себя целый класс за NAT.
 */
export const passwordChangeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  skipSuccessfulRequests: true,
  keyGenerator: (req) => {
    const userId = (req as { user?: { userId?: string } }).user?.userId;
    // ipKeyGenerator, а не req.ip: у IPv6 клиенту принадлежит целая подсеть,
    // и по одному адресу лимит обходится сменой последнего сегмента.
    return userId ?? ipKeyGenerator(req.ip ?? "");
  },
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: {
    error: "Слишком много попыток смены пароля. Попробуйте через 15 минут.",
  },
});

/** Генерация через платный API — ограничиваем расход */
export const aiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 30,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: {
    error: "Слишком много запросов к генератору. Попробуйте позже.",
  },
});
