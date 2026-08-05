import { prisma } from "../../db/prisma.js";
import { Request, Response } from "express";
import { shuffleArray } from "../../utils/shuffle.js";

type QuestionDTO = {
  id: string;
  text: string | null;
  type: string | null;
  points: number | null;
  order: number | null;
  imageUrl: string | null;
  options: {
    id: string;
    text: string | null;
    imageUrl: string | null;
  }[];
};

export const getQuiz = async (req: Request, res: Response) => {
  const quizId = req.params.quizId;
  const studentId = (req as any).user.userId;

  if (!quizId || typeof quizId !== "string") {
    return res.status(400).json({ message: "quizId is required" });
  }

  try {
    // 1. Билет уже сформирован на старте попытки (startAttempt) — состав вопросов
    // и их стоимость берём только оттуда, ничего не выбираем заново.
    const attempt = await prisma.attempts.findFirst({
      where: { quiz_id: quizId, student_id: studentId, status: "in_progress" },
      select: { id: true },
    });

    if (!attempt) {
      return res
        .status(404)
        .json({ message: "Активная попытка не найдена. Начните тест заново." });
    }

    // 2. Достаем вопросы билета вместе с вариантами ответов.
    // is_correct НЕ выбираем — правильные ответы клиенту не уходят.
    const ticket = await prisma.attempt_questions.findMany({
      where: { attempt_id: attempt.id },
      orderBy: { order_index: "asc" },
      select: {
        points: true,
        order_index: true,
        questions: {
          select: {
            id: true,
            text: true,
            type: true,
            image_url: true,
            answer_options: { select: { id: true, text: true, image_url: true } },
          },
        },
      },
    });

    if (!ticket.length) {
      return res.json({ questions: [] });
    }

    const questions: QuestionDTO[] = ticket
      .filter((row) => row.questions !== null)
      .map((row) => ({
        id: row.questions!.id,
        text: row.questions!.text,
        type: row.questions!.type,
        points: row.points,
        order: row.order_index,
        imageUrl: row.questions!.image_url,
        // Порядок вариантов мешаем на каждый запрос — на оценку он не влияет
        options: shuffleArray(
          row.questions!.answer_options.map((ao) => ({
            id: ao.id,
            text: ao.text,
            imageUrl: ao.image_url,
          })),
        ),
      }));

    return res.json({ questions });
  } catch (error) {
    console.error("Database error in getQuiz:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
