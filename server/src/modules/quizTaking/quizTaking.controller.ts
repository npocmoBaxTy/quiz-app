import { prisma } from "../../db/prisma.js";
import { Request, Response } from "express";

// Вспомогательная функция для честного перемешивания массива (Тасование Фишера-Йетса)
const shuffleArray = <T>(array: T[]): T[] => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j]!, newArray[i]!];
  }
  return newArray;
};

type QuestionDTO = {
  id: string;
  text: string | null;
  type: string | null;
  points: number | null;
  order: number | null;
  options: {
    id: string;
    text: string | null;
  }[];
};

export const getQuiz = async (req: Request, res: Response) => {
  const quizId = req.params.quizId;
  if (!quizId || typeof quizId !== "string") {
    return res.status(400).json({ message: "quizId is required" });
  }

  try {
    // 1. Сначала узнаем лимит вопросов для этого теста
    const quiz = await prisma.quizzes.findUnique({
      where: { id: quizId },
      select: { questions_limit: true },
    });
    const questionsLimit = quiz?.questions_limit;

    // 2. Достаем все вопросы и ответы
    const quizQuestions = await prisma.quiz_questions.findMany({
      where: { quiz_id: quizId },
      orderBy: { order_index: "asc" },
      select: {
        points: true,
        order_index: true,
        questions: {
          select: {
            id: true,
            text: true,
            type: true,
            answer_options: { select: { id: true, text: true } },
          },
        },
      },
    });

    if (!quizQuestions.length) {
      return res.json({ questions: [] });
    }

    // 3. Группируем вопросы
    let questions: QuestionDTO[] = quizQuestions
      .filter((qq) => qq.questions !== null)
      .map((qq) => ({
        id: qq.questions!.id,
        text: qq.questions!.text,
        type: qq.questions!.type,
        points: qq.points,
        order: qq.order_index,
        options: qq.questions!.answer_options.map((ao) => ({ id: ao.id, text: ao.text })),
      }));

    // 4. ПРИМЕНЯЕМ ЛИМИТ И ПЕРЕМЕШИВАЕМ ВОПРОСЫ
    if (
      questionsLimit &&
      questionsLimit > 0 &&
      questionsLimit < questions.length
    ) {
      questions = shuffleArray(questions).slice(0, questionsLimit);
    } else {
      questions = shuffleArray(questions);
    }

    // 5. ПЕРЕМЕШИВАЕМ ВАРИАНТЫ ОТВЕТОВ ВНУТРИ КАЖДОГО ВОПРОСА
    questions.forEach((q) => {
      if (q.options.length > 0) {
        q.options = shuffleArray(q.options);
      }
    });

    // 6. Отдаем готовый безопасный массив на фронтенд
    return res.json({ questions });
  } catch (error) {
    console.error("Database error in getQuiz:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
