import bcrypt from "bcrypt";
import {
  getUserProfile,
  updateFullName,
  setStudentGroup,
  updateAvatarUrl,
  groupExists,
  findPasswordHash,
  updatePasswordHash,
} from "./profile.repository.js";
import { deleteAllRefreshTokens } from "../auth/auth.repository.js";

export async function fetchProfile(userId: string) {
  const profile = await getUserProfile(userId);
  if (!profile) throw new Error("User not found");
  return profile;
}

export async function updateProfile(
  userId: string,
  data: {
    fullName?: string | undefined;
    groupId?: string | undefined;
    avatarUrl?: string | undefined;
  },
) {
  const fullName = data.fullName?.trim();
  if (fullName !== undefined) {
    if (fullName.length < 2) throw new Error("Full name is too short");
    await updateFullName(userId, fullName);
  }

  if (data.groupId) {
    const exists = await groupExists(data.groupId);
    if (!exists) throw new Error("Invalid group");
    await setStudentGroup(userId, data.groupId);
  }

  if (data.avatarUrl) {
    await updateAvatarUrl(userId, data.avatarUrl);
  }

  return fetchProfile(userId);
}

export async function changePassword(
  userId: string,
  currentPassword: string,
  newPassword: string,
) {
  if (newPassword.length < 8) {
    throw new Error("Password too short");
  }

  const record = await findPasswordHash(userId);
  if (!record) throw new Error("User not found");

  const isMatch = await bcrypt.compare(currentPassword, record.password_hash);
  if (!isMatch) throw new Error("Invalid current password");

  const hash = await bcrypt.hash(newPassword, 10);
  await updatePasswordHash(userId, hash);

  // Смена пароля должна разлогинивать все остальные сессии, иначе украденный
  // refresh-токен продолжал бы работать ещё неделю.
  await deleteAllRefreshTokens(userId);
}
