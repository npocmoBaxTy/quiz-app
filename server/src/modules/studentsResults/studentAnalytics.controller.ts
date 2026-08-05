import { Request, Response } from "express";
import { prisma } from "../../db/prisma.js";

// Только автоматически проверяемые типы. Текстовые ответы в проекте нигде
// не оцениваются (сохраняются с points: 0), поэтому в разборе они дали бы
// вечные 0% — это не показатель знаний студента.
const QUESTION_TYPES = ["single", "multiple"] as const;

export const getStudentAnalytics = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const studentId = (req as any).user.userId;

  try {
    // 1. Все завершенные попытки студента в хронологическом порядке
    const attempts = await prisma.attempts.findMany({
      where: { student_id: studentId, status: "finished" },
      orderBy: { finished_at: "asc" },
      select: {
        id: true,
        quiz_id: true,
        score: true,
        max_score: true,
        finished_at: true,
        quizzes: { select: { title: true, passing: true } },
      },
    });

    if (attempts.length === 0) {
      res.status(200).json({
        timeline: [],
        byQuestionType: [],
        summary: {
          totalAttempts: 0,
          averagePercent: null,
          recentAveragePercent: null,
          bestPercent: null,
          passedCount: 0,
        },
      });
      return;
    }

    const attemptIds = attempts.map((a) => a.id);

    // 2. Билеты попыток и ответы студента — считаем разбор по типам вопросов
    const [ticketRows, answerRows] = await prisma.$transaction([
      prisma.attempt_questions.findMany({
        where: { attempt_id: { in: attemptIds } },
        select: {
          attempt_id: true,
          question_id: true,
          points: true,
          questions: { select: { type: true } },
        },
      }),
      prisma.student_answers.findMany({
        where: { attempt_id: { in: attemptIds } },
        select: {
          attempt_id: true,
          question_id: true,
          points: true,
          questions: { select: { type: true } },
        },
      }),
    ]);

    // Набранные баллы за вопрос: суммируем все строки ответов (у multiple их несколько)
    const earnedByPair = new Map<string, number>();
    for (const row of answerRows) {
      if (!row.question_id) continue;
      const key = `${row.attempt_id}:${row.question_id}`;
      earnedByPair.set(key, (earnedByPair.get(key) ?? 0) + (row.points ?? 0));
    }

    // Максимум баллов берем из билета попытки. Для старых попыток, отправленных
    // до внедрения attempt_questions, билета нет — добираем из quiz_questions.
    type Pair = { key: string; type: string | null; maxPoints: number | null };
    const pairs = new Map<string, Pair>();

    for (const row of ticketRows) {
      const key = `${row.attempt_id}:${row.question_id}`;
      pairs.set(key, {
        key,
        type: row.questions?.type ?? null,
        maxPoints: row.points,
      });
    }

    const attemptsWithoutTicket = attempts.filter(
      (a) => !ticketRows.some((r) => r.attempt_id === a.id),
    );

    if (attemptsWithoutTicket.length > 0) {
      const quizIds = [
        ...new Set(
          attemptsWithoutTicket
            .map((a) => a.quiz_id)
            .filter((id): id is string => id !== null),
        ),
      ];

      const quizQuestions = await prisma.quiz_questions.findMany({
        where: { quiz_id: { in: quizIds } },
        select: { quiz_id: true, question_id: true, points: true },
      });

      const pointsByQuizQuestion = new Map(
        quizQuestions.map((qq) => [`${qq.quiz_id}:${qq.question_id}`, qq.points]),
      );

      for (const attempt of attemptsWithoutTicket) {
        const rows = answerRows.filter((r) => r.attempt_id === attempt.id);
        for (const row of rows) {
          if (!row.question_id) continue;
          const key = `${attempt.id}:${row.question_id}`;
          if (pairs.has(key)) continue;
          pairs.set(key, {
            key,
            type: row.questions?.type ?? null,
            maxPoints:
              pointsByQuizQuestion.get(`${attempt.quiz_id}:${row.question_id}`) ??
              null,
          });
        }
      }
    }

    const statsByType = new Map(
      QUESTION_TYPES.map((type) => [type, { total: 0, correct: 0 }]),
    );

    for (const pair of pairs.values()) {
      if (!pair.type) continue;
      const bucket = statsByType.get(pair.type as (typeof QUESTION_TYPES)[number]);
      if (!bucket) continue;
      if (!pair.maxPoints || pair.maxPoints <= 0) continue;

      bucket.total += 1;
      if ((earnedByPair.get(pair.key) ?? 0) >= pair.maxPoints) {
        bucket.correct += 1;
      }
    }

    const byQuestionType = QUESTION_TYPES.map((type) => {
      const { total, correct } = statsByType.get(type)!;
      return {
        type,
        total,
        correct,
        percentage: total > 0 ? Math.round((correct / total) * 100) : null,
      };
    }).filter((row) => row.total > 0);

    // 3. Динамика результатов
    const timeline = attempts.map((a) => ({
      attemptId: a.id,
      quizTitle: a.quizzes?.title ?? null,
      passing: a.quizzes?.passing ?? null,
      completedAt: a.finished_at,
      percentage:
        a.max_score > 0 ? Math.round(((a.score ?? 0) / a.max_score) * 100) : 0,
    }));

    const percentages = timeline.map((p) => p.percentage);
    const average = (values: number[]) =>
      values.length > 0
        ? Math.round(values.reduce((sum, v) => sum + v, 0) / values.length)
        : null;

    const monthAgo = new Date();
    monthAgo.setDate(monthAgo.getDate() - 30);
    const recentPercentages = timeline
      .filter((p) => p.completedAt && p.completedAt >= monthAgo)
      .map((p) => p.percentage);

    const passedCount = timeline.filter(
      (p) => p.passing !== null && p.percentage >= p.passing,
    ).length;

    res.status(200).json({
      timeline,
      byQuestionType,
      summary: {
        totalAttempts: timeline.length,
        averagePercent: average(percentages),
        recentAveragePercent: average(recentPercentages),
        bestPercent: Math.max(...percentages),
        passedCount,
      },
    });
  } catch (error) {
    console.error("Ошибка при получении аналитики студента:", error);
    res.status(500).json({ error: "Ошибка сервера" });
  }
};
