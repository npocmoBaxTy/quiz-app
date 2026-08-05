import { Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import { prisma } from "../../db/prisma.js";
import { shuffleArray } from "../../utils/shuffle.js";

type StartAttemptResult =
  | { kind: "not_found" }
  | { kind: "empty_quiz" }
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
        select: { id: true, questions_limit: true, published: true },
      });

      // Роут доступен только студентам, поэтому черновик — это 404:
      // начать попытку по неопубликованному тесту нельзя.
      if (!quiz || !quiz.published) {
        return { kind: "not_found" };
      }

      // 2. Защита от случайного обновления страницы —
      // тесты общие и без лимита попыток, но незавершённую попытку не дублируем.
      // Билет у неё уже зафиксирован, поэтому возвращаем ту же попытку.
      const inProgress = await tx.attempts.findFirst({
        where: { quiz_id: quizId, student_id: studentId, status: "in_progress" },
        select: { id: true },
      });

      if (inProgress) {
        return { kind: "ok", attemptId: inProgress.id };
      }

      // 3. Формируем билет НА СЕРВЕРЕ: состав вопросов и их стоимость
      // фиксируются здесь и дальше нигде не принимаются от клиента.
      const quizQuestions = await tx.quiz_questions.findMany({
        where: { quiz_id: quizId },
        select: { question_id: true, points: true },
      });

      const available = quizQuestions.filter(
        (qq): qq is { question_id: string; points: number | null } =>
          qq.question_id !== null,
      );

      if (available.length === 0) {
        return { kind: "empty_quiz" };
      }

      const limit = quiz.questions_limit;
      const shuffled = shuffleArray(available);
      const ticket =
        limit && limit > 0 && limit < shuffled.length
          ? shuffled.slice(0, limit)
          : shuffled;

      // 4. Создаём НОВУЮ попытку вместе с её билетом
      const attemptId = uuidv4();
      const startedAt = new Date();

      await tx.attempts.create({
        data: {
          id: attemptId,
          quiz_id: quizId,
          student_id: studentId,
          status: "in_progress",
          started_at: startedAt,
        },
      });

      await tx.attempt_questions.createMany({
        data: ticket.map((qq, idx) => ({
          id: uuidv4(),
          attempt_id: attemptId,
          question_id: qq.question_id,
          order_index: idx,
          points: qq.points ?? 0,
          created_at: startedAt,
        })),
      });

      return { kind: "ok", attemptId };
    });

    if (result.kind === "not_found") {
      res.status(404).json({ error: "Тест не найден" });
      return;
    }

    if (result.kind === "empty_quiz") {
      res.status(400).json({ error: "В этом тесте пока нет вопросов" });
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
