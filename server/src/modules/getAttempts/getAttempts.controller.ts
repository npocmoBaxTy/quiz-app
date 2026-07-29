import { prisma } from "../../db/prisma.js";
import { Request, Response } from "express";

// Контроллер для списка попыток
export const getQuizAttemptsList = async (req: Request, res: Response) => {
  try {
    const quizId = req.params.quizId as string;
    const teacherId = req.user?.userId;
    if (!teacherId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Тест должен принадлежать именно этому преподавателю —
    // иначе любой TEACHER мог бы смотреть попытки чужих тестов по quizId.
    const quiz = await prisma.quizzes.findFirst({
      where: { id: quizId, created_by: teacherId },
      select: { id: true },
    });
    if (!quiz) {
      return res.status(404).json({ error: "Тест не найден" });
    }

    const attempts = await prisma.attempts.findMany({
      where: { quiz_id: quizId },
      orderBy: { finished_at: "desc" },
      select: {
        id: true,
        score: true,
        status: true,
        finished_at: true,
        users: { select: { full_name: true } },
      },
    });

    res.json(
      attempts.map((a) => ({
        id: a.id,
        studentName: a.users?.full_name ?? null,
        score: a.score,
        status: a.status,
        finishedAt: a.finished_at,
      })),
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
      where: { status: "finished", quizzes: { created_by: teacherId } },
      orderBy: { finished_at: "desc" },
      take: 20,
      select: {
        id: true,
        score: true,
        status: true,
        finished_at: true,
        users: { select: { full_name: true } },
        quizzes: { select: { title: true, passing: true } },
      },
    });

    // Возвращаем на фронт
    res.json(
      attempts.map((a) => ({
        id: a.id,
        score: a.score,
        status: a.status,
        finishedAt: a.finished_at,
        studentName: a.users?.full_name ?? null,
        quizTitle: a.quizzes?.title ?? null,
        passing: a.quizzes?.passing ?? null,
      })),
    );
  } catch (error) {
    console.error(error);
    res.status(500).send("Error");
  }
};

export const getAttemptDetails = async (req: Request, res: Response) => {
  try {
    const attemptId = req.params.attemptId as string;
    const teacherId = req.user?.userId;
    if (!teacherId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // 1. Получаем инфо о попытке — только если она относится к тесту ЭТОГО
    // преподавателя, иначе любой TEACHER мог бы читать чужие попытки по attemptId.
    const attempt = await prisma.attempts.findFirst({
      where: { id: attemptId, quizzes: { created_by: teacherId } },
      select: {
        id: true,
        score: true,
        status: true,
        users: { select: { full_name: true } },
      },
    });

    if (!attempt) {
      return res.status(404).json({ error: "Попытка не найдена" });
    }

    // 2. Получаем вопросы и ВЫБОР студента
    const studentAnswers = await prisma.student_answers.findMany({
      where: { attempt_id: attemptId },
      select: {
        id: true,
        question_id: true,
        is_correct: true,
        points: true,
        text_answer: true,
        answer_option_id: true,
        questions: { select: { text: true, type: true } },
      },
    });

    // 3. Получаем ВСЕ варианты ответов для этих вопросов
    const questionIds = studentAnswers
      .map((a) => a.question_id)
      .filter((id): id is string => id !== null);

    const allOptions = questionIds.length > 0
      ? await prisma.answer_options.findMany({
          where: { question_id: { in: questionIds } },
          select: { id: true, question_id: true, text: true, is_correct: true },
        })
      : [];

    // 4. Приклеиваем варианты ответов к соответствующим вопросам
    const answers = studentAnswers.map((sa) => ({
      answerId: sa.id,
      questionId: sa.question_id,
      isCorrect: sa.is_correct,
      points: sa.points,
      textAnswer: sa.text_answer,
      questionText: sa.questions?.text ?? null,
      questionType: sa.questions?.type ?? null,
      selectedOptionId: sa.answer_option_id,
      options: allOptions
        .filter((opt) => opt.question_id === sa.question_id)
        .map((opt) => ({ id: opt.id, text: opt.text, isCorrect: opt.is_correct })),
    }));

    res.json({
      attempt: {
        id: attempt.id,
        score: attempt.score,
        status: attempt.status,
        full_name: attempt.users?.full_name ?? null,
      },
      answers,
    });
  } catch (error) {
    console.error("Ошибка в getAttemptDetails:", error);
    res.status(500).json({ error: "Внутренняя ошибка сервера" });
  }
};
