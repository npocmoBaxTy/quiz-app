import { Request, Response } from "express";
import { prisma } from "../../db/prisma.js";

export const getQuizzes = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;

    const quizzes = await prisma.quizzes.findMany({
      where: { created_by: userId },
      orderBy: { created_at: "desc" },
      select: {
        id: true,
        title: true,
        passing: true,
        created_at: true,
        published: true,
        time_limit: true,
        users: { select: { full_name: true } },
        attempts: { select: { score: true } },
        _count: { select: { quiz_questions: true, attempts: true } },
      },
    });

    const result = quizzes.map((q) => {
      const scores = q.attempts
        .map((a) => a.score)
        .filter((s): s is number => s !== null);

      const avgScore =
        scores.length > 0
          ? Math.round((scores.reduce((sum, s) => sum + s, 0) / scores.length) * 10) / 10
          : 0;

      return {
        id: q.id,
        title: q.title,
        passing: q.passing,
        created_at: q.created_at,
        published: q.published,
        time_limit: q.time_limit,
        questions_count: q._count.quiz_questions,
        creator_name: q.users?.full_name ?? null,
        avgScore,
        attemptsCount: q._count.attempts,
      };
    });

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Ошибка получения тестов" });
  }
};
