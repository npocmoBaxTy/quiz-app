import jwt from "jsonwebtoken";
import { env } from "./env.js";

export function signTokens(payload: { userId: string; role: string | null }) {
  const accessToken = jwt.sign(
    { userId: payload.userId, role: payload.role },
    env.jwtSecret,
    { expiresIn: "30m" }
  )

  const refreshToken = jwt.sign(
    { userId: payload.userId },
    env.refreshSecret,
    { expiresIn: "7d" }
  )

  return { accessToken, refreshToken }
}

export function verifyToken(token: string) {
  return jwt.verify(token, env.jwtSecret);
}
