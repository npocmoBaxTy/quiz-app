import { prisma } from "../../db/prisma.js";
import { Request, Response } from "express";
import { getAttemptTiming } from "../../utils/attemptTiming.js";

// Контроллер для списка попыток
export const getQuizAttemptsList = async (req: Request, res: Response) => {
  try {
    const quizId = req.params.quizId as string;

    // Преподаватель просматривает попытки студентов без ограничений —
    // по любому тесту, вне зависимости от того, кто его создал.
    const attempts = await prisma.attempts.findMany({
      where: { quiz_id: quizId },
      orderBy: { finished_at: "desc" },
      select: {
        id: true,
        score: true,
        status: true,
        started_at: true,
        finished_at: true,
        users: { select: { full_name: true } },
        quizzes: { select: { time_limit: true } },
      },
    });

    res.json(
      attempts.map((a) => {
        const timing = getAttemptTiming({
          startedAt: a.started_at,
          finishedAt: a.finished_at,
          timeLimit: a.quizzes?.time_limit ?? null,
        });

        return {
          id: a.id,
          studentName: a.users?.full_name ?? null,
          score: a.score,
          status: a.status,
          finishedAt: a.finished_at,
          isLate: timing.isLate,
          overtimeSeconds: timing.overtimeSeconds,
        };
      }),
    );
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Ошибка сервера" });
  }
};

export const getRecentAttempts = async (req: Request, res: Response) => {
  try {
    const teacherId = req.user?.userId;
    if (!teacherId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const attempts = await prisma.attempts.findMany({
      where: { status: "finished" },
      orderBy: { finished_at: "desc" },
      take: 20,
      select: {
        id: true,
        score: true,
        status: true,
        started_at: true,
        finished_at: true,
        users: { select: { full_name: true } },
        quizzes: { select: { title: true, passing: true, time_limit: true } },
      },
    });

    // Возвращаем на фронт
    res.json(
      attempts.map((a) => {
        const timing = getAttemptTiming({
          startedAt: a.started_at,
          finishedAt: a.finished_at,
          timeLimit: a.quizzes?.time_limit ?? null,
        });

        return {
          id: a.id,
          score: a.score,
          status: a.status,
          finishedAt: a.finished_at,
          studentName: a.users?.full_name ?? null,
          quizTitle: a.quizzes?.title ?? null,
          passing: a.quizzes?.passing ?? null,
          isLate: timing.isLate,
          overtimeSeconds: timing.overtimeSeconds,
        };
      }),
    );
  } catch (error) {
    console.error(error);
    res.status(500).send("Error");
  }
};

export const getAttemptDetails = async (req: Request, res: Response) => {
  try {
    const attemptId = req.params.attemptId as string;

    // Преподаватель видит детали любой попытки без ограничений.
    const attempt = await prisma.attempts.findUnique({
      where: { id: attemptId },
      select: {
        id: true,
        score: true,
        status: true,
        started_at: true,
        finished_at: true,
        users: { select: { full_name: true } },
        quizzes: { select: { time_limit: true } },
      },
    });

    if (!attempt) {
      return res.status(404).json({ error: "Попытка не найдена" });
    }

    // 2. Ответы студента. На multiple-вопрос их несколько (по строке на
    // выбранный вариант) — ниже они схлопываются в один вопрос.
    const studentAnswers = await prisma.student_answers.findMany({
      where: { attempt_id: attemptId },
      select: {
        question_id: true,
        is_correct: true,
        points: true,
        text_answer: true,
        answer_option_id: true,
      },
    });

    // 3. Билет попытки — он задаёт состав и порядок вопросов в разборе.
    // Только по нему видно вопросы, которые студент пропустил: строк
    // в student_answers у них нет.
    const ticket = await prisma.attempt_questions.findMany({
      where: { attempt_id: attemptId },
      orderBy: { order_index: "asc" },
      select: {
        question_id: true,
        points: true,
        questions: { select: { id: true, text: true, type: true, image_url: true } },
      },
    });

    // Попытки, сданные до фиксации билета, его не имеют — для них
    // показываем то, на что студент ответил, как и раньше.
    const questionRows = ticket.length
      ? ticket.map((row) => ({
          questionId: row.question_id,
          maxPoints: row.points,
          question: row.questions,
        }))
      : await (async () => {
          const ids = [
            ...new Set(
              studentAnswers
                .map((a) => a.question_id)
                .filter((id): id is string => id !== null),
            ),
          ];
          const questions = ids.length
            ? await prisma.questions.findMany({
                where: { id: { in: ids } },
                select: { id: true, text: true, type: true, image_url: true },
              })
            : [];
          return questions.map((q) => ({
            questionId: q.id,
            maxPoints: null as number | null,
            question: q,
          }));
        })();

    // 4. Варианты ответов для всех вопросов разбора
    const questionIds = questionRows.map((r) => r.questionId);

    const allOptions = questionIds.length
      ? await prisma.answer_options.findMany({
          where: { question_id: { in: questionIds } },
          select: {
            id: true,
            question_id: true,
            text: true,
            is_correct: true,
            image_url: true,
          },
        })
      : [];

    // 5. Собираем разбор: одна запись на вопрос билета
    const answers = questionRows.map((row) => {
      const rows = studentAnswers.filter((sa) => sa.question_id === row.questionId);
      const isSkipped = rows.length === 0;

      return {
        questionId: row.questionId,
        questionText: row.question?.text ?? null,
        questionType: row.question?.type ?? null,
        questionImageUrl: row.question?.image_url ?? null,
        // Набранное суммируем: у multiple балл лежит в первой строке
        points: rows.reduce((sum, r) => sum + (r.points ?? 0), 0),
        maxPoints: row.maxPoints,
        isCorrect: isSkipped ? false : (rows[0]?.is_correct ?? null),
        isSkipped,
        textAnswer: rows.find((r) => r.text_answer !== null)?.text_answer ?? null,
        // Все выбранные варианты, а не первый попавшийся
        selectedOptionIds: rows
          .map((r) => r.answer_option_id)
          .filter((id): id is string => id !== null),
        options: allOptions
          .filter((opt) => opt.question_id === row.questionId)
          .map((opt) => ({
            id: opt.id,
            text: opt.text,
            imageUrl: opt.image_url,
            isCorrect: opt.is_correct,
          })),
      };
    });

    const timing = getAttemptTiming({
      startedAt: attempt.started_at,
      finishedAt: attempt.finished_at,
      timeLimit: attempt.quizzes?.time_limit ?? null,
    });

    res.json({
      attempt: {
        id: attempt.id,
        score: attempt.score,
        status: attempt.status,
        full_name: attempt.users?.full_name ?? null,
        startedAt: attempt.started_at,
        finishedAt: attempt.finished_at,
        isLate: timing.isLate,
        overtimeSeconds: timing.overtimeSeconds,
      },
      answers,
    });
  } catch (error) {
    console.error("Ошибка в getAttemptDetails:", error);
    res.status(500).json({ error: "Внутренняя ошибка сервера" });
  }
};
