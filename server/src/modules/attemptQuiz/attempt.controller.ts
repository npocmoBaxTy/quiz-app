import { Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import { prisma } from "../../db/prisma.js";

// --- 1. ТИПЫ ДЛЯ ЗАПРОСА ---

export interface QuizResponseItem {
  questionId: string;
  type: "text" | "multiple" | "single";
  values: string[];
}

export interface SubmitQuizBody {
  attemptId: string;
  quizId: string;
  ticketQuestionIds: string[];
  responses: QuizResponseItem[];
}

type SubmitResult =
  | { kind: "not_found" }
  | { kind: "already_finished" }
  | { kind: "ok"; totalScore: number; maxScoreForTicket: number };

// --- 2. КОНТРОЛЛЕР ---

export const submitQuizAttempt = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const { attemptId, quizId, ticketQuestionIds, responses } =
    req.body as SubmitQuizBody;
  const studentId = (req as any).user.userId;

  try {
    const result = await prisma.$transaction(async (tx): Promise<SubmitResult> => {
      // 1. Проверяем статус попытки
      const attempt = await tx.attempts.findFirst({
        where: { id: attemptId, student_id: studentId },
        select: { status: true },
      });

      if (!attempt) {
        return { kind: "not_found" };
      }

      if (attempt.status === "finished") {
        return { kind: "already_finished" };
      }

      // --- БЛОК АВТОПРОВЕРКИ И ПОДСЧЕТА МАКСИМУМА ---

      // Достаем баллы для всех вопросов в базе
      const quizQuestions = await tx.quiz_questions.findMany({
        where: { quiz_id: quizId },
        select: { question_id: true, points: true },
      });

      const maxPointsMap: Record<string, number> = {};
      quizQuestions.forEach((row) => {
        if (row.question_id) maxPointsMap[row.question_id] = row.points || 0;
      });

      // Считаем максимальный балл ТОЛЬКО для выданных вопросов (ticketQuestionIds)
      let maxScoreForTicket = 0;
      if (ticketQuestionIds && ticketQuestionIds.length > 0) {
        maxScoreForTicket = quizQuestions
          .filter((row) => row.question_id && ticketQuestionIds.includes(row.question_id))
          .reduce((sum, row) => sum + (row.points || 0), 0);
      }

      const questionIds = responses.map((r) => r.questionId);

      const correctAnswersMap: Record<
        string,
        { options: string[]; text: string | null }
      > = {};

      // Достаем правильные ответы из базы
      if (questionIds.length > 0) {
        const correctOptions = await tx.answer_options.findMany({
          where: { question_id: { in: questionIds }, is_correct: true },
          select: { question_id: true, id: true, text: true },
        });

        correctOptions.forEach((row) => {
          if (!row.question_id) return;
          let answerData = correctAnswersMap[row.question_id];
          if (!answerData) {
            answerData = { options: [], text: null };
            correctAnswersMap[row.question_id] = answerData;
          }
          answerData.options.push(row.id);
          if (row.text) {
            answerData.text = row.text;
          }
        });
      }

      await tx.student_answers.deleteMany({ where: { attempt_id: attemptId } });

      let totalScore = 0;

      // --- СОХРАНЕНИЕ ОТВЕТОВ И ПОДСЧЕТ БАЛЛОВ ---

      const answersToInsert: {
        id: string;
        attempt_id: string;
        question_id: string;
        answer_option_id?: string;
        text_answer?: string;
        is_correct: boolean | null;
        points: number;
      }[] = [];

      for (const response of responses) {
        const { questionId, type, values } = response;
        const maxPoints = maxPointsMap[questionId] || 0;
        const correctData = correctAnswersMap[questionId] || {
          options: [],
          text: null,
        };

        let earnedPoints = 0;

        if (type === "text") {
          const textAnswer = values[0] || "";

          answersToInsert.push({
            id: uuidv4(),
            attempt_id: attemptId,
            question_id: questionId,
            text_answer: textAnswer,
            is_correct: null,
            points: 0,
          });
        } else {
          const studentOptions = [...values].sort();
          const correctOptions = [...correctData.options].sort();

          const isCorrect =
            JSON.stringify(studentOptions) === JSON.stringify(correctOptions);
          earnedPoints = isCorrect ? maxPoints : 0;

          values.forEach((optionId, idx) => {
            answersToInsert.push({
              id: uuidv4(),
              attempt_id: attemptId,
              question_id: questionId,
              answer_option_id: optionId,
              is_correct: isCorrect,
              points: idx === 0 ? earnedPoints : 0,
            });
          });
        }

        totalScore += earnedPoints;
      }

      if (answersToInsert.length > 0) {
        await tx.student_answers.createMany({ data: answersToInsert });
      }

      // --- ФИНАЛЬНЫЙ АПДЕЙТ ПОПЫТКИ ---

      await tx.attempts.updateMany({
        where: { id: attemptId, student_id: studentId },
        data: {
          score: totalScore,
          max_score: maxScoreForTicket,
          status: "finished",
          finished_at: new Date(),
        },
      });

      return { kind: "ok", totalScore, maxScoreForTicket };
    });

    if (result.kind === "not_found") {
      res.status(404).json({ error: "Попытка не найдена или доступ запрещен" });
      return;
    }

    if (result.kind === "already_finished") {
      res.status(400).json({ error: "Этот тест уже был завершен ранее" });
      return;
    }

    res.status(200).json({
      success: true,
      attemptId,
      score: result.totalScore,
      maxScore: result.maxScoreForTicket,
      message: "Тест успешно проверен!",
    });
  } catch (error) {
    console.error(
      "Ошибка при проверке теста:",
      error instanceof Error ? error.message : error,
    );
    res
      .status(500)
      .json({ error: "Ошибка при сохранении и проверке результатов" });
  }
};
