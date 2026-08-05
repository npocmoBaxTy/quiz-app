import { Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import { prisma } from "../../db/prisma.js";

export const createQuiz = async (req: Request, res: Response) => {
  try {
    const {
      title,
      published,
      passing,
      timeLimit,
      questionsLimit,
      questions,
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
          published,
          created_at: now,
          questions_limit: questionsLimit,
        },
      });

      // 2. ПОДГОТОВКА ДАННЫХ
      const questionsData: { id: string; text: string; type: string; created_by: string; created_at: Date; image_url: string | null }[] = [];
      const quizQuestionsData: { id: string; quiz_id: string; question_id: string; points: number; order_index: number }[] = [];
      const answersData: { id: string; question_id: string; text: string; is_correct: boolean; image_url: string | null }[] = [];

      questions.forEach((q: any, index: number) => {
        const questionId = uuidv4();

        questionsData.push({
          id: questionId,
          text: q.text,
          type: q.type || "multiple",
          created_by: userId,
          created_at: now,
          image_url: q.imageUrl || null,
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
              image_url: ans.imageUrl || null,
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
    });

    res.json({ success: true, quizId });
  } catch (err: unknown) {
    const errorMessage =
      err instanceof Error ? err.message : "Неизвестная ошибка";
    console.error("Ошибка при создании квиза (Bulk Insert):", errorMessage);

    res.status(500).json({ error: "Ошибка сервера при сохранении теста" });
  }
};
