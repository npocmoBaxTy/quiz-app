import { prisma } from "../../db/prisma.js";

export async function getQuizzesByTeacher(teacherId: string) {
  return prisma.quizzes.findMany({
    where: { created_by: teacherId },
    select: { id: true, title: true, created_at: true },
    orderBy: { created_at: "desc" },
  });
}
