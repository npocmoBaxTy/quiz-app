import { Request, Response } from "express";
import { register, login, getGroups } from "./auth.service.js";
import { getCurrentUser } from "./auth.service.js";
import {
  deleteRefreshToken,
  findRefreshToken,
  findUserById,
  saveRefreshToken,
} from "./auth.repository.js";
import jwt from "jsonwebtoken";
import { signTokens } from "../../config/auth.js";
import { env } from "../../config/env.js";

export async function groupsController(req: Request, res: Response) {
  try {
    const groups = await getGroups();
    res.json(groups);
  } catch (err) {
    res.status(500).json({ error: "Не удалось загрузить список групп" });
  }
}

export async function registerController(req: Request, res: Response) {
  try {
    const { email, password, name, groupId } = req.body;

    const { user, accessToken, refreshToken } = await register(
      email,
      password,
      name,
      groupId,
    );

    // сохранить refresh в БД
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await saveRefreshToken(user.id, refreshToken, expiresAt);

    const isProd = process.env.NODE_ENV === "production";

    // access token
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? "none" : "lax",
      maxAge: 1000 * 60 * 30,
      path: "/",
    });

    // refresh token
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? "none" : "lax",
      maxAge: 1000 * 60 * 60 * 24 * 7,
      path: "/",
    });

    res.json({ user });
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
  }
}

export async function loginController(req: Request, res: Response) {
  try {
    const { email, password } = req.body;
    const result = await login(email, password);

    // сохранить refreshToken в БД
    await saveRefreshToken(
      result.user.id,
      result.refreshToken,
      new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 дней
    );
    res.cookie("accessToken", result.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 15 * 60 * 1000, // 15 минут
      path: "/",
    });
    res.cookie("refreshToken", result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: "/",
    });
    // Токены живут только в httpOnly-куках и в теле ответа не отдаются:
    // иначе любой XSS смог бы их прочитать из JS.
    res.json({ user: result.user });
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
  }
}

//Контроллер Рефреша токена
const REFRESH_SECRET = env.refreshSecret;
export async function refreshController(req: Request, res: Response) {
  try {
    const token = req.cookies.refreshToken;

    if (!token) {
      return res.status(401).json({ error: "No refresh token" });
    }

    // 1. проверка JWT
    const payload = jwt.verify(token, REFRESH_SECRET) as { userId: string };

    // 2. проверка в БД
    const stored = await findRefreshToken(token);
    if (!stored) {
      return res.status(401).json({ error: "Invalid refresh token" });
    }

    // 3. проверка срока (на всякий случай)
    if (new Date(stored.expires_at) < new Date()) {
      await deleteRefreshToken(token);
      return res.status(401).json({ error: "Token expired" });
    }

    // 4. удаляем старый (rotation)
    await deleteRefreshToken(token);

    // 5. создаём новые токены
    const user = await findUserById(payload.userId);
    if (!user) {
      return res.status(401).json({ error: "Invalid refresh token" });
    }
    const { accessToken, refreshToken } = signTokens({
      userId: payload.userId,
      role: user.role,
    });

    // 6. сохраняем новый refresh
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await saveRefreshToken(payload.userId, refreshToken, expiresAt);

    // 7. обновляем cookie
    const isProd = process.env.NODE_ENV === "production";

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? "none" : "lax",
      maxAge: 1000 * 60 * 30,
      path: "/",
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? "none" : "lax",
      maxAge: 1000 * 60 * 60 * 24 * 7,
      path: "/",
    });

    return res.json({ ok: true });
  } catch {
    return res.status(401).json({ error: "Invalid refresh token" });
  }
}

export async function meController(req: Request, res: Response) {
  try {
    const userId = (req as any).user.userId;

    const user = await getCurrentUser(userId);

    res.json(user);
  } catch (err) {
    res.status(401).json({ error: "Unauthorized" });
  }
}

export async function logoutController(req: Request, res: Response) {
  console.log("COOKIES:", req.cookies);
  try {
    const refreshToken = req.cookies.refreshToken;

    if (refreshToken) {
      await deleteRefreshToken(refreshToken);
    }

    res.clearCookie("accessToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      path: "/",
    });

    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      path: "/",
    });

    return res.json({ ok: true });
  } catch {
    return res.status(500).json({ error: "Logout error" });
  }
}
