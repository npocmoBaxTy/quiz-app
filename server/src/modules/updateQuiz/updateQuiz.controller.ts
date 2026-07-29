import { prisma } from "../../db/prisma.js";
import { Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";

export const updateQuiz = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const quizId = req.params.quizId as string;
  const teacherId = req.user?.userId; // Получаем ID из токена
  if (!teacherId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const {
    title,
    timeLimit,
    attemptLimit,
    passing,
    published,
    startDate,
    dueDate,
    assignedGroups,
    assignedStudents,
    questions,
  } = req.body;

  try {
    await prisma.$transaction(async (tx) => {
      // 1. Обновляем основные настройки самого теста
      const updateResult = await tx.quizzes.updateMany({
        where: { id: quizId, created_by: teacherId },
        data: { title, time_limit: timeLimit, attempt_limit: attemptLimit, passing, published },
      });

      if (updateResult.count === 0) {
        throw new Error(
          "Тест не найден или у вас нет прав на его редактирование",
        );
      }

      // 2. Обновляем назначения (quiz_assignments)
      await tx.quiz_assignments.deleteMany({ where: { quiz_id: quizId } });

      const assignmentsData: {
        id: string;
        quiz_id: string;
        group_id?: string;
        student_id?: string;
        start_date: any;
        due_date: any;
      }[] = [];

      if (Array.isArray(assignedGroups) && assignedGroups.length > 0) {
        assignedGroups.forEach((groupId: string) => {
          assignmentsData.push({
            id: uuidv4(),
            quiz_id: quizId,
            group_id: groupId,
            start_date: startDate || null,
            due_date: dueDate || null,
          });
        });
      }

      if (Array.isArray(assignedStudents) && assignedStudents.length > 0) {
        assignedStudents.forEach((studentId: string) => {
          assignmentsData.push({
            id: uuidv4(),
            quiz_id: quizId,
            student_id: studentId,
            start_date: startDate || null,
            due_date: dueDate || null,
          });
        });
      }

      if (assignmentsData.length > 0) {
        await tx.quiz_assignments.createMany({ data: assignmentsData });
      }

      // 3. Обновляем вопросы
      // Удаляем только СВЯЗИ (quiz_questions), но НЕ сами вопросы из таблицы questions
      await tx.quiz_questions.deleteMany({ where: { quiz_id: quizId } });

      // Мы всегда создаем новые записи в таблице questions.
      // Это гарантирует, что старые попытки (attempts) будут ссылаться
      // на те формулировки вопросов, которые были в момент прохождения.
      const questionsData = questions.map((q: any) => ({ id: uuidv4(), text: q.text, type: q.type }));
      const quizQuestionsData = questions.map((q: any, i: number) => ({
        id: uuidv4(),
        quiz_id: quizId,
        question_id: questionsData[i].id,
        points: q.points,
        order_index: i,
      }));
      const answersData = questions.flatMap((q: any, i: number) =>
        Array.isArray(q.answers)
          ? q.answers.map((ans: any) => ({
              id: uuidv4(),
              question_id: questionsData[i].id,
              text: ans.text,
              is_correct: ans.isCorrect,
            }))
          : [],
      );

      if (questionsData.length > 0) {
        await tx.questions.createMany({ data: questionsData });
      }
      if (quizQuestionsData.length > 0) {
        await tx.quiz_questions.createMany({ data: quizQuestionsData });
      }
      if (answersData.length > 0) {
        await tx.answer_options.createMany({ data: answersData });
      }
    });

    res.json({ success: true, message: "Тест успешно обновлен" });
  } catch (error: any) {
    console.error("Ошибка при обновлении теста:", error);
    res
      .status(500)
      .json({ error: error.message || "Ошибка сервера при обновлении теста" });
  }
};

export const deleteQuiz = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const quizId = req.params.quizId as string;
  const teacherId = req.user?.userId;
  if (!teacherId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  try {
    const deleted = await prisma.$transaction(async (tx) => {
      const quiz = await tx.quizzes.findFirst({
        where: { id: quizId, created_by: teacherId },
        select: { id: true },
      });
      if (!quiz) return false;

      const questionIds = (
        await tx.quiz_questions.findMany({ where: { quiz_id: quizId }, select: { question_id: true } })
      )
        .map((q) => q.question_id)
        .filter((id): id is string => id !== null);

      const attemptIds = (
        await tx.attempts.findMany({ where: { quiz_id: quizId }, select: { id: true } })
      ).map((a) => a.id);

      await tx.student_answers.deleteMany({
        where: { OR: [{ attempt_id: { in: attemptIds } }, { question_id: { in: questionIds } }] },
      });
      await tx.attempt_questions.deleteMany({
        where: { OR: [{ attempt_id: { in: attemptIds } }, { question_id: { in: questionIds } }] },
      });
      await tx.attempts.deleteMany({ where: { quiz_id: quizId } });
      await tx.answer_options.deleteMany({ where: { question_id: { in: questionIds } } });
      await tx.quiz_questions.deleteMany({ where: { quiz_id: quizId } });
      await tx.questions.deleteMany({ where: { id: { in: questionIds } } });
      await tx.quiz_assignments.deleteMany({ where: { quiz_id: quizId } });
      await tx.quizzes.delete({ where: { id: quizId } });

      return true;
    });

    if (!deleted) {
      res.status(404).json({ error: "Тест не найден или у вас нет прав на его удаление" });
      return;
    }

    res.json({ success: true, message: "Тест удалён" });
  } catch (error: any) {
    console.error("Ошибка при удалении теста:", error);
    res.status(500).json({ error: error.message || "Ошибка сервера при удалении теста" });
  }
};

export const getQuizForEdit = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const quizId = req.params.quizId as string;
  const teacherId = req.user?.userId;
  if (!teacherId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  try {
    // 1. Ищем настройки теста
    const quiz = await prisma.quizzes.findFirst({
      where: { id: quizId, created_by: teacherId },
      select: { id: true, title: true, passing: true, time_limit: true, attempt_limit: true, published: true },
    });

    if (!quiz) {
      res.status(404).json({ error: "Тест не найден" });
      return;
    }

    // 2. Достаем вопросы вместе с ответами
    const quizQuestions = await prisma.quiz_questions.findMany({
      where: { quiz_id: quizId },
      orderBy: { order_index: "asc" },
      select: {
        id: true,
        points: true,
        order_index: true,
        questions: {
          select: {
            id: true,
            text: true,
            type: true,
            answer_options: { select: { id: true, text: true, is_correct: true } },
          },
        },
      },
    });

    const questions = quizQuestions.map((qq) => ({
      id: qq.id,
      base_question_id: qq.questions?.id ?? null,
      text: qq.questions?.text ?? null,
      type: qq.questions?.type ?? null,
      points: qq.points,
      order_index: qq.order_index,
      answers: (qq.questions?.answer_options ?? []).map((opt) => ({
        id: opt.id,
        text: opt.text,
        isCorrect: opt.is_correct,
      })),
    }));

    const assignments = await prisma.quiz_assignments.findMany({
      where: { quiz_id: quizId },
      select: { group_id: true, student_id: true, start_date: true, due_date: true },
    });

    const assignedGroups = assignments.map((a) => a.group_id).filter((id) => id !== null);
    const assignedStudents = assignments.map((a) => a.student_id).filter((id) => id !== null);

    const startDate = assignments[0]?.start_date ?? null;
    const dueDate = assignments[0]?.due_date ?? null;

    res.json({
      success: true,
      quiz,
      questions,
      assignedGroups,
      assignedStudents,
      start_date: startDate,
      due_date: dueDate,
    });
  } catch (error: unknown) {
    console.error("Ошибка в getQuizForEdit:", error);
    res.status(500).json({ error: "Ошибка при загрузке данных теста" });
  }
};
