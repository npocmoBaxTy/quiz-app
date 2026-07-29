import { Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import { prisma } from "../../db/prisma.js";

type StartAttemptResult =
  | { kind: "not_found" }
  | { kind: "limit_reached"; attemptLimit: number | null }
  | { kind: "ok"; attemptId: string };

export const startQuizAttempt = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const { quizId } = req.body;

  const studentId = (req as any).user.userId;

  try {
    const result = await prisma.$transaction(async (tx): Promise<StartAttemptResult> => {
      // 1. Получаем настройки теста (лимит попыток)
      const quiz = await tx.quizzes.findUnique({
        where: { id: quizId },
        select: { attempt_limit: true },
      });

      if (!quiz) {
        return { kind: "not_found" };
      }

      const attemptLimit = quiz.attempt_limit;

      // 2. Считаем, сколько раз студент УЖЕ проходил этот тест
      const currentAttempts = await tx.attempts.count({
        where: { quiz_id: quizId, student_id: studentId },
      });

      // 3. Защита: проверяем лимиты
      if (attemptLimit !== null && currentAttempts >= attemptLimit) {
        return { kind: "limit_reached", attemptLimit };
      }

      // 4. Защита от случайного обновления страницы
      const inProgress = await tx.attempts.findFirst({
        where: { quiz_id: quizId, student_id: studentId, status: "in_progress" },
        select: { id: true },
      });

      if (inProgress) {
        // Если студент закрыл вкладку и вернулся, отдаем ему старую попытку.
        return { kind: "ok", attemptId: inProgress.id };
      }

      // 5. Все проверки пройдены — создаем НОВУЮ попытку
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

    if (result.kind === "limit_reached") {
      res.status(403).json({
        error: "Вы исчерпали лимит попыток для этого теста",
        maxAttempts: result.attemptLimit,
      });
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
