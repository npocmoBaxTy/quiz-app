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

    // Тесты общие — доступны всем студентам без назначений, групп и лимитов попыток.
    const quizzes = await prisma.quizzes.findMany({
      where: { published: true },
      orderBy: { created_at: "desc" },
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
    });

    const result = quizzes.map((q) => ({
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
    }));

    res.json(result);
  } catch (err) {
    console.error("Ошибка при получении списка тестов:", err);
    res.status(500).json({ error: "Ошибка сервера при получении тестов" });
  }
};
