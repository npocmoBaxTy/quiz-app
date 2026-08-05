import { prisma } from "../../db/prisma.js";

export async function getUserProfile(userId: string) {
  const user = await prisma.users.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      full_name: true,
      role: true,
      created_at: true,
      avatar_url: true,
      group_students: {
        select: { groups: { select: { id: true, name: true } } },
        take: 1,
      },
    },
  });

  if (!user) return null;

  const { group_students, ...rest } = user;
  return {
    ...rest,
    group: group_students[0]?.groups ?? null,
  };
}

export async function updateFullName(userId: string, fullName: string) {
  return prisma.users.update({
    where: { id: userId },
    data: { full_name: fullName },
    select: { id: true, full_name: true },
  });
}

export async function setStudentGroup(userId: string, groupId: string) {
  await prisma.$transaction([
    prisma.group_students.deleteMany({ where: { student_id: userId } }),
    prisma.group_students.create({
      data: { student_id: userId, group_id: groupId },
    }),
  ]);
}

export async function updateAvatarUrl(userId: string, avatarUrl: string) {
  return prisma.users.update({
    where: { id: userId },
    data: { avatar_url: avatarUrl },
    select: { id: true, avatar_url: true },
  });
}

export async function groupExists(groupId: string) {
  const group = await prisma.groups.findUnique({ where: { id: groupId } });
  return !!group;
}

export async function findPasswordHash(userId: string) {
  return prisma.users.findUnique({
    where: { id: userId },
    select: { password_hash: true },
  });
}

export async function updatePasswordHash(userId: string, passwordHash: string) {
  await prisma.users.update({
    where: { id: userId },
    data: { password_hash: passwordHash },
  });
}
