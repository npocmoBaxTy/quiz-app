import bcrypt from "bcrypt";
import { findUserByEmail, createUser, listGroups, addStudentToGroup } from "./auth.repository.js";
import { signTokens } from "../../config/auth.js";
import { findUserById } from "./auth.repository.js";

export async function register(
  email: string,
  password: string,
  name: string,
  groupId: string,
) {
  const existing = await findUserByEmail(email);
  if (existing) throw new Error("User already exists");

  const groups = await listGroups();
  if (!groups.some((g) => g.id === groupId)) {
    throw new Error("Invalid group");
  }

  const hash = await bcrypt.hash(password, 10);

  // Публичная регистрация всегда создаёт STUDENT — роль TEACHER/ADMIN
  // назначается только вручную в БД, никогда через клиентский ввод.
  const user = await createUser(email, hash, name, "STUDENT");
  await addStudentToGroup(user.id, groupId);

  const { accessToken, refreshToken } = signTokens({
    userId: user.id,
    role: user.role,
  });

  return { user, accessToken, refreshToken };
}

export async function getGroups() {
  return listGroups();
}

export async function login(email: string, password: string) {
  const user = await findUserByEmail(email);
  if (!user) throw new Error("invalid credentials");

  const match = await bcrypt.compare(password, user.password_hash);
  if (!match) throw new Error("invalid credentials");

  const { accessToken, refreshToken } = signTokens({
    userId: user.id,
    role: user.role,
  });

  // Никогда не отдаём password_hash клиенту
  const { password_hash, ...safeUser } = user;

  return { user: safeUser, accessToken, refreshToken };
}

export async function getCurrentUser(userId: string) {
  return findUserById(userId);
}
