import { Request, Response } from "express";
import { fetchProfile, updateProfile, changePassword } from "./profile.service.js";
import { findUserById, saveRefreshToken } from "../auth/auth.repository.js";
import { signTokens } from "../../config/auth.js";

const ERROR_CODES: Record<string, string> = {
  "User not found": "USER_NOT_FOUND",
  "Full name is too short": "NAME_TOO_SHORT",
  "Invalid group": "INVALID_GROUP",
  "Password too short": "PASSWORD_TOO_SHORT",
  "Invalid current password": "INVALID_CURRENT_PASSWORD",
};

function sendServiceError(res: Response, err: unknown) {
  const message = err instanceof Error ? err.message : "Unknown error";
  const code = ERROR_CODES[message] ?? "UNKNOWN_ERROR";
  const status = code === "USER_NOT_FOUND" ? 404 : 400;
  res.status(status).json({ error: message, code });
}

export async function getProfileController(req: Request, res: Response) {
  try {
    const userId = (req as any).user.userId;
    const profile = await fetchProfile(userId);
    res.json(profile);
  } catch (err) {
    sendServiceError(res, err);
  }
}

export async function updateProfileController(req: Request, res: Response) {
  try {
    const userId = (req as any).user.userId;
    const { fullName, groupId, avatarUrl } = req.body as {
      fullName?: string;
      groupId?: string;
      avatarUrl?: string;
    };
    const profile = await updateProfile(userId, { fullName, groupId, avatarUrl });
    res.json(profile);
  } catch (err) {
    sendServiceError(res, err);
  }
}

export async function changePasswordController(req: Request, res: Response) {
  try {
    const userId = (req as any).user.userId;
    const { currentPassword, newPassword } = req.body as {
      currentPassword?: string;
      newPassword?: string;
    };

    if (!currentPassword || !newPassword) {
      res.status(400).json({ error: "Missing fields", code: "MISSING_FIELDS" });
      return;
    }

    await changePassword(userId, currentPassword, newPassword);

    // Все refresh-токены отозваны, включая текущий, — выдаём новую пару,
    // чтобы разлогинились чужие сессии, а не тот, кто менял пароль.
    const user = await findUserById(userId);
    if (user) {
      const { accessToken, refreshToken } = signTokens({
        userId,
        role: user.role,
      });
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      await saveRefreshToken(userId, refreshToken, expiresAt);

      const isProd = process.env.NODE_ENV === "production";
      const cookieBase = {
        httpOnly: true,
        secure: isProd,
        sameSite: isProd ? ("none" as const) : ("lax" as const),
        path: "/",
      };

      res.cookie("accessToken", accessToken, {
        ...cookieBase,
        maxAge: 1000 * 60 * 30,
      });
      res.cookie("refreshToken", refreshToken, {
        ...cookieBase,
        maxAge: 1000 * 60 * 60 * 24 * 7,
      });
    }

    res.json({ success: true });
  } catch (err) {
    sendServiceError(res, err);
  }
}
