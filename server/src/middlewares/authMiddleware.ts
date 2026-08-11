import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { env } from "../config/env.js";

interface AuthPayload extends JwtPayload {
  userId: string;
  role: string;
}

export function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const token = req.cookies.accessToken;
  if (!token) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const payload = jwt.verify(token, env.jwtSecret) as AuthPayload;

    (req as any).user = payload;

    next();
  } catch {
    return res.status(401).json({ error: "Invalid token" });
  }
}
