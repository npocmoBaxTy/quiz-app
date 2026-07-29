import { Request, Response } from "express";
import { prisma } from "../../db/prisma.js";

export const getStudentResults = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const studentId = (req as any).user.userId;

  // Достаем параметры из URL (по умолчанию страница 1, лимит 6 карточек)
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 6;
  const offset = (page - 1) * limit;

  try {
    const where = { student_id: studentId, status: "finished" };

    const [attempts, total] = await prisma.$transaction([
      prisma.attempts.findMany({
        where,
        orderBy: { finished_at: "desc" },
        skip: offset,
        take: limit,
        select: {
          id: true,
          score: true,
          max_score: true,
          finished_at: true,
          quizzes: {
            select: {
              id: true,
              title: true,
              passing: true,
              users: { select: { full_name: true } },
            },
          },
        },
      }),
      prisma.attempts.count({ where }),
    ]);

    const rows = attempts.map((a) => ({
      attemptId: a.id,
      quizId: a.quizzes?.id ?? null,
      quizTitle: a.quizzes?.title ?? null,
      teacherName: a.quizzes?.users?.full_name ?? null,
      score: a.score,
      passingScore: a.quizzes?.passing ?? null,
      completedAt: a.finished_at,
      maxScore: a.max_score,
    }));

    const totalPages = Math.ceil(total / limit);

    // Отправляем на фронтенд данные и мету
    res.status(200).json({
      data: rows,
      meta: {
        total,
        page,
        totalPages,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Ошибка сервера" });
  }
};

export const getAttemptDetailsById = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const attemptId = req.params.attemptId as string;
  const studentId = (req as any).user.userId;

  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const offset = (page - 1) * limit;

  try {
    // 1. Получаем шапку попытки
    const attempt = await prisma.attempts.findFirst({
      where: { id: attemptId, student_id: studentId, status: "finished" },
      select: {
        id: true,
        score: true,
        max_score: true,
        finished_at: true,
        quiz_id: true,
        quizzes: { select: { id: true, title: true } },
      },
    });

    if (!attempt) {
      res.status(404).json({ error: "Результаты не найдены" });
      return;
    }

    // 2. Достаем вопросы только для текущей попытки
    const answeredQuestionIds = (
      await prisma.student_answers.findMany({
        where: { attempt_id: attemptId },
        distinct: ["question_id"],
        select: { question_id: true },
      })
    )
      .map((r) => r.question_id)
      .filter((id): id is string => id !== null);

    const totalQuestions = answeredQuestionIds.length;

    const quizQuestions = await prisma.quiz_questions.findMany({
      where: { quiz_id: attempt.quiz_id, question_id: { in: answeredQuestionIds } },
      orderBy: { order_index: "asc" },
      skip: offset,
      take: limit,
      select: {
        points: true,
        questions: {
          select: {
            id: true,
            text: true,
            type: true,
            student_answers: {
              where: { attempt_id: attemptId },
              select: { points: true, text_answer: true, answer_option_id: true },
            },
            answer_options: {
              select: { id: true, text: true, is_correct: true },
            },
          },
        },
      },
    });

    const questions = quizQuestions.map((qq) => {
      const q = qq.questions!;
      const earnedPoints = q.student_answers.reduce((sum, sa) => sum + (sa.points ?? 0), 0);
      const studentAnswers = q.student_answers
        .filter((sa) => sa.text_answer !== null || sa.answer_option_id !== null)
        .map((sa) => (q.type === "text" ? sa.text_answer : sa.answer_option_id));

      return {
        id: q.id,
        text: q.text,
        type: q.type,
        maxPoints: qq.points,
        earnedPoints,
        studentAnswers,
        options: q.answer_options.map((ao) => ({ id: ao.id, text: ao.text, isCorrect: ao.is_correct })),
      };
    });

    const totalPages = Math.ceil(totalQuestions / limit);

    res.status(200).json({
      attemptId: attempt.id,
      quizTitle: attempt.quizzes?.title ?? null,
      score: attempt.score,
      maxScore: attempt.max_score,
      completedAt: attempt.finished_at,
      questions,
      meta: {
        total: totalQuestions,
        page,
        totalPages,
        limit,
      },
    });
  } catch (error) {
    console.error("Ошибка при получении деталей:", error);
    res.status(500).json({ error: "Ошибка сервера" });
  }
};
