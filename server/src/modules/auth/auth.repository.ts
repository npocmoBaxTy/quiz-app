import { prisma } from "../../db/prisma.js";

export async function findUserByEmail(email: string) {
  return prisma.users.findUnique({ where: { email } });
}

export async function createUser(email: string, passwordHash: string, name: string, role: string) {
  return prisma.users.create({
    data: {
      email,
      password_hash: passwordHash,
      full_name: name,
      role: role.toUpperCase(),
    },
    select: { id: true, email: true, full_name: true, role: true },
  });
}

export async function listGroups() {
  return prisma.groups.findMany({
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });
}

export async function addStudentToGroup(studentId: string, groupId: string) {
  await prisma.group_students.create({
    data: { student_id: studentId, group_id: groupId },
  });
}

export async function findUserById(id: string) {
  return prisma.users.findUnique({
    where: { id },
    select: { id: true, email: true, full_name: true, role: true },
  });
}

//Сохранение токенов(accesToken & refreshToken) в БД
export async function saveRefreshToken(
  userId: string,
  token: string,
  expiresAt: Date
) {
  await prisma.refresh_tokens.create({
    data: { user_id: userId, token, expires_at: expiresAt },
  });
}

export async function findRefreshToken(token: string) {
  return prisma.refresh_tokens.findFirst({ where: { token } });
}

export async function deleteRefreshToken(token: string) {
  await prisma.refresh_tokens.deleteMany({ where: { token } });
}
