import { Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import { prisma } from "../../db/prisma.js";

export const createQuiz = async (req: Request, res: Response) => {
  try {
    const {
      title,
      attemptLimit,
      published,
      passing,
      timeLimit,
      questionsLimit,
      questions,
      assignedGroups,
      assignedStudents,
      startDate,
      dueDate,
    } = req.body;

    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const quizId = uuidv4();
    const now = new Date(); // Фиксируем единое время для всех записей транзакции

    await prisma.$transaction(async (tx) => {
      // 1. Создаем сам Квиз
      await tx.quizzes.create({
        data: {
          id: quizId,
          title,
          passing,
          created_by: userId,
          time_limit: timeLimit,
          attempt_limit: attemptLimit,
          published,
          created_at: now,
          questions_limit: questionsLimit,
        },
      });

      // 2. ПОДГОТОВКА ДАННЫХ
      const questionsData: { id: string; text: string; type: string; created_by: string; created_at: Date }[] = [];
      const quizQuestionsData: { id: string; quiz_id: string; question_id: string; points: number; order_index: number }[] = [];
      const answersData: { id: string; question_id: string; text: string; is_correct: boolean }[] = [];

      questions.forEach((q: any, index: number) => {
        const questionId = uuidv4();

        questionsData.push({
          id: questionId,
          text: q.text,
          type: q.type || "multiple",
          created_by: userId,
          created_at: now,
        });

        quizQuestionsData.push({
          id: uuidv4(),
          quiz_id: quizId,
          question_id: questionId,
          points: Number(q.points) || 0,
          order_index: index,
        });

        if (q.type !== "text" && q.answers && Array.isArray(q.answers)) {
          q.answers.forEach((ans: any) => {
            answersData.push({
              id: uuidv4(),
              question_id: questionId,
              text: ans.text,
              is_correct: !!ans.isCorrect,
            });
          });
        }
      });

      // 3. МАССОВАЯ ВСТАВКА
      if (questionsData.length > 0) {
        await tx.questions.createMany({ data: questionsData });
      }

      if (quizQuestionsData.length > 0) {
        await tx.quiz_questions.createMany({ data: quizQuestionsData });
      }

      if (answersData.length > 0) {
        await tx.answer_options.createMany({ data: answersData });
      }

      // 4. МАССОВАЯ ВСТАВКА НАЗНАЧЕНИЙ (Группы и Студенты)
      if (Array.isArray(assignedGroups) && assignedGroups.length > 0) {
        await tx.quiz_assignments.createMany({
          data: assignedGroups.map((groupId) => ({
            id: uuidv4(),
            quiz_id: quizId,
            group_id: groupId,
            start_date: startDate || null,
            due_date: dueDate || null,
          })),
        });
      }

      if (Array.isArray(assignedStudents) && assignedStudents.length > 0) {
        await tx.quiz_assignments.createMany({
          data: assignedStudents.map((studentId) => ({
            id: uuidv4(),
            quiz_id: quizId,
            student_id: studentId,
            start_date: startDate || null,
            due_date: dueDate || null,
          })),
        });
      }
    });

    res.json({ success: true, quizId });
  } catch (err: unknown) {
    const errorMessage =
      err instanceof Error ? err.message : "Неизвестная ошибка";
    console.error("Ошибка при создании квиза (Bulk Insert):", errorMessage);

    res.status(500).json({ error: "Ошибка сервера при сохранении теста" });
  }
};
