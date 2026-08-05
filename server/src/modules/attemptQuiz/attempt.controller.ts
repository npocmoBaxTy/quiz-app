import { Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import { prisma } from "../../db/prisma.js";
import { getAttemptTiming } from "../../utils/attemptTiming.js";

// --- 1. ТИПЫ ДЛЯ ЗАПРОСА ---

export interface QuizResponseItem {
  questionId: string;
  type: "text" | "multiple" | "single";
  values: string[];
}

// quizId и ticketQuestionIds клиент больше не присылает: состав билета и его
// стоимость берутся только из attempt_questions, зафиксированных на старте.
export interface SubmitQuizBody {
  attemptId: string;
  responses: QuizResponseItem[];
}

type SubmitResult =
  | { kind: "not_found" }
  | { kind: "already_finished" }
  | {
      kind: "ok";
      totalScore: number;
      maxScoreForTicket: number;
      isLate: boolean;
      overtimeSeconds: number;
    };

// --- 2. КОНТРОЛЛЕР ---

export const submitQuizAttempt = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const { attemptId, responses } = req.body as SubmitQuizBody;
  const studentId = (req as any).user.userId;

  if (!attemptId || !Array.isArray(responses)) {
    res.status(400).json({ error: "Некорректное тело запроса" });
    return;
  }

  try {
    const result = await prisma.$transaction(async (tx): Promise<SubmitResult> => {
      // 1. Проверяем статус попытки
      const attempt = await tx.attempts.findFirst({
        where: { id: attemptId, student_id: studentId },
        select: {
          status: true,
          quiz_id: true,
          started_at: true,
          quizzes: { select: { time_limit: true } },
        },
      });

      if (!attempt) {
        return { kind: "not_found" };
      }

      if (attempt.status === "finished") {
        return { kind: "already_finished" };
      }

      // --- БЛОК АВТОПРОВЕРКИ И ПОДСЧЕТА МАКСИМУМА ---

      // Билет попытки — единственный источник правды о составе вопросов
      // и их стоимости. Всё, что пришло от клиента, для этого не используется.
      let ticket = await tx.attempt_questions.findMany({
        where: { attempt_id: attemptId },
        select: { question_id: true, points: true },
      });

      // Попытки, начатые до фиксации билета на старте, его не имеют —
      // для них билетом считается весь тест целиком.
      if (ticket.length === 0) {
        const quizQuestions = await tx.quiz_questions.findMany({
          where: { quiz_id: attempt.quiz_id ?? "" },
          select: { question_id: true, points: true },
        });

        ticket = quizQuestions
          .filter((row) => row.question_id !== null)
          .map((row) => ({
            question_id: row.question_id as string,
            points: row.points,
          }));

        if (ticket.length > 0) {
          await tx.attempt_questions.createMany({
            data: ticket.map((row, idx) => ({
              id: uuidv4(),
              attempt_id: attemptId,
              question_id: row.question_id,
              order_index: idx,
              points: row.points ?? 0,
              created_at: new Date(),
            })),
          });
        }
      }

      const maxPointsMap: Record<string, number> = {};
      let maxScoreForTicket = 0;
      ticket.forEach((row) => {
        maxPointsMap[row.question_id] = row.points ?? 0;
        maxScoreForTicket += row.points ?? 0;
      });

      // Ответы на вопросы вне билета отбрасываем — иначе через них можно
      // было бы дописать себе баллы сверх выданного варианта.
      const gradedResponses = responses.filter((r) =>
        Object.prototype.hasOwnProperty.call(maxPointsMap, r.questionId),
      );

      const questionIds = gradedResponses.map((r) => r.questionId);

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

      // Билет уже лежит в attempt_questions и не пересоздаётся — чистим
      // только ответы, чтобы повторная отправка не задвоила строки.
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

      for (const response of gradedResponses) {
        const { questionId, type } = response;
        const values = Array.isArray(response.values) ? response.values : [];
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

      // Сдачу после лимита времени принимаем и оцениваем как обычно —
      // просрочка только фиксируется, чтобы преподаватель её видел.
      const finishedAt = new Date();
      const timing = getAttemptTiming({
        startedAt: attempt.started_at,
        finishedAt,
        timeLimit: attempt.quizzes?.time_limit ?? null,
      });

      await tx.attempts.updateMany({
        where: { id: attemptId, student_id: studentId },
        data: {
          score: totalScore,
          max_score: maxScoreForTicket,
          status: "finished",
          finished_at: finishedAt,
        },
      });

      return {
        kind: "ok",
        totalScore,
        maxScoreForTicket,
        isLate: timing.isLate,
        overtimeSeconds: timing.overtimeSeconds,
      };
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
      isLate: result.isLate,
      overtimeSeconds: result.overtimeSeconds,
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
