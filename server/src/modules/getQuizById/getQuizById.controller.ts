import { prisma } from "../../db/prisma.js";
import { Request, Response } from "express";

export const getQuizById = async (req: Request, res: Response) => {
  const quizId = req.params.quizId;

  // 1. Basic validation
  if (!quizId || typeof quizId !== "string") {
    return res.status(400).json({ message: "quizId is required" });
  }

  try {
    // 2. Execute query. Поля перечислены явно: created_by и прочая
    // служебная информация клиенту не нужна.
    const quiz = await prisma.quizzes.findUnique({
      where: { id: quizId },
      select: {
        id: true,
        title: true,
        passing: true,
        time_limit: true,
        questions_limit: true,
        published: true,
        created_at: true,
      },
    });

    // 3. Handle 'No Results'
    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found" });
    }

    // 4. Черновик виден только преподавателю — студенту неопубликованного
    // теста не существует.
    const isTeacher = (req as any).user?.role === "TEACHER";
    if (!quiz.published && !isTeacher) {
      return res.status(404).json({ message: "Quiz not found" });
    }

    // 5. Success
    return res.json(quiz);
  } catch (error) {
    // 5. Log the error for debugging and tell the client something went wrong
    console.error("Database error in getQuizById:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
