import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET as string;
const REFRESH_SECRET = process.env.REFRESH_SECRET as string;

export function signTokens(payload: { userId: string; role: string | null }) {
  const accessToken = jwt.sign(
    { userId: payload.userId, role: payload.role },
    JWT_SECRET as string,
    { expiresIn: "30m" }
  )

  const refreshToken = jwt.sign(
    { userId: payload.userId },
    REFRESH_SECRET,
    { expiresIn: "7d" }
  )

  return { accessToken, refreshToken }
}

export function verifyToken(token: string) {
  return jwt.verify(token, JWT_SECRET);
}