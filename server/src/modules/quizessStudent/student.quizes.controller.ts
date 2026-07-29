import { Request, Response } from "express";
import { prisma } from "../../db/prisma.js";

export const getQuizesList = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const studentId = req.user?.userId;
    if (!studentId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    const now = new Date();

    const studentGroups = await prisma.group_students.findMany({
      where: { student_id: studentId },
      select: { group_id: true },
    });
    const groupIds = studentGroups.map((g) => g.group_id).filter((id): id is string => id !== null);

    const assignments = await prisma.quiz_assignments.findMany({
      where: {
        quizzes: { published: true },
        OR: [
          { student_id: studentId },
          groupIds.length > 0 ? { group_id: { in: groupIds } } : { group_id: { in: [] } },
        ],
        AND: [
          { OR: [{ start_date: null }, { start_date: { lte: now } }] },
          { OR: [{ due_date: null }, { due_date: { gte: now } }] },
        ],
      },
      select: {
        quiz_id: true,
        start_date: true,
        due_date: true,
        quizzes: {
          select: {
            id: true,
            title: true,
            passing: true,
            created_at: true,
            published: true,
            time_limit: true,
            attempt_limit: true,
            questions_limit: true,
            users: { select: { full_name: true } },
            attempts: {
              where: { student_id: studentId, status: "finished" },
              select: { id: true },
            },
          },
        },
      },
    });

    // DISTINCT ON (quiz_id) ORDER BY due_date DESC (Postgres: NULLS FIRST for DESC)
    const byQuiz = new Map<string, (typeof assignments)[number]>();
    for (const a of assignments) {
      if (!a.quiz_id) continue;
      const existing = byQuiz.get(a.quiz_id);
      if (!existing) {
        byQuiz.set(a.quiz_id, a);
        continue;
      }
      const currentIsGreater =
        a.due_date === null ||
        (existing.due_date !== null && a.due_date > existing.due_date);
      if (currentIsGreater) {
        byQuiz.set(a.quiz_id, a);
      }
    }

    const result = Array.from(byQuiz.values())
      .filter((a) => {
        const q = a.quizzes!;
        return q.attempts.length < (q.attempt_limit ?? Infinity);
      })
      .map((a) => {
        const q = a.quizzes!;
        return {
          id: q.id,
          title: q.title,
          passing: q.passing,
          created_at: q.created_at,
          published: q.published,
          time_limit: q.time_limit,
          attempt_limit: q.attempt_limit,
          questions_limit: q.questions_limit,
          used_attempts: q.attempts.length,
          creator_name: q.users?.full_name ?? null,
          startDate: a.start_date,
          dueDate: a.due_date,
        };
      });

    res.json(result);
  } catch (err) {
    console.error("Ошибка при получении списка тестов:", err);
    res.status(500).json({ error: "Ошибка сервера при получении тестов" });
  }
};
