import { Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import { prisma } from "../../db/prisma.js";

type StartAttemptResult =
  | { kind: "not_found" }
  | { kind: "ok"; attemptId: string };

export const startQuizAttempt = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const { quizId } = req.body;

  const studentId = (req as any).user.userId;

  try {
    const result = await prisma.$transaction(async (tx): Promise<StartAttemptResult> => {
      // 1. Убеждаемся, что тест существует
      const quiz = await tx.quizzes.findUnique({
        where: { id: quizId },
        select: { id: true },
      });

      if (!quiz) {
        return { kind: "not_found" };
      }

      // 2. Защита от случайного обновления страницы —
      // тесты общие и без лимита попыток, но незавершённую попытку не дублируем.
      const inProgress = await tx.attempts.findFirst({
        where: { quiz_id: quizId, student_id: studentId, status: "in_progress" },
        select: { id: true },
      });

      if (inProgress) {
        return { kind: "ok", attemptId: inProgress.id };
      }

      // 3. Создаём НОВУЮ попытку
      const attemptId = uuidv4();
      await tx.attempts.create({
        data: {
          id: attemptId,
          quiz_id: quizId,
          student_id: studentId,
          status: "in_progress",
          started_at: new Date(),
        },
      });

      return { kind: "ok", attemptId };
    });

    if (result.kind === "not_found") {
      res.status(404).json({ error: "Тест не найден" });
      return;
    }

    res.status(200).json({ success: true, attemptId: result.attemptId });
  } catch (error) {
    console.error(
      "Ошибка при старте теста:",
      error instanceof Error ? error.message : error,
    );
    res.status(500).json({ error: "Ошибка сервера при создании попытки" });
  }
};
