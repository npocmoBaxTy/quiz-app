import { Request, Response } from "express";
import { prisma } from "../../db/prisma.js";

type BankAnswer = {
  text: string;
  isCorrect: boolean;
  imageUrl: string | null;
};

type BankQuestion = {
  id: string;
  text: string;
  type: string;
  points: number;
  imageUrl: string | null;
  createdAt: Date | null;
  answers: BankAnswer[];
  sources: { id: string; title: string }[];
};

const MAX_LIMIT = 200;

// Ключ дедупликации: одна и та же формулировка одного типа — один вопрос
// банка. Дубли неизбежны: updateQuiz при каждом сохранении создаёт новые
// строки в questions, чтобы не сломать старые попытки студентов.
const dedupKey = (text: string, type: string) =>
  `${type}::${text.trim().toLowerCase().replace(/\s+/g, " ")}`;

export const getQuestionBank = async (req: Request, res: Response) => {
  const teacherId = req.user?.userId;
  if (!teacherId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const search = String(req.query.search ?? "").trim().toLowerCase();
  const type = String(req.query.type ?? "").trim();
  const quizId = String(req.query.quizId ?? "").trim();
  const excludeQuizId = String(req.query.excludeQuizId ?? "").trim();

  const limit = Math.min(
    Math.max(Number(req.query.limit) || 20, 1),
    MAX_LIMIT,
  );
  const offset = Math.max(Number(req.query.offset) || 0, 0);

  try {
    // Банк — это вопросы, которые сейчас реально привязаны хотя бы к одному
    // тесту преподавателя. Через quiz_questions, а не через questions.created_by:
    // updateQuiz создаёт вопросы без created_by, и в questions остаются
    // «осиротевшие» исторические версии, которым в банке не место.
    const rows = await prisma.quiz_questions.findMany({
      where: {
        quizzes: { created_by: teacherId },
        ...(excludeQuizId ? { quiz_id: { not: excludeQuizId } } : {}),
        questions: { isNot: null },
      },
      select: {
        points: true,
        quizzes: { select: { id: true, title: true } },
        questions: {
          select: {
            id: true,
            text: true,
            type: true,
            image_url: true,
            created_at: true,
            answer_options: {
              select: { text: true, is_correct: true, image_url: true },
            },
          },
        },
      },
    });

    // Свежие формулировки должны выигрывать при дедупликации.
    const sorted = rows.sort((a, b) => {
      const at = a.questions?.created_at?.getTime() ?? 0;
      const bt = b.questions?.created_at?.getTime() ?? 0;
      return bt - at;
    });

    const byKey = new Map<string, BankQuestion>();

    for (const row of sorted) {
      const q = row.questions;
      if (!q || !q.text?.trim()) continue;

      const key = dedupKey(q.text, q.type ?? "single");
      const existing = byKey.get(key);

      if (existing) {
        // Тот же вопрос из другого теста — дописываем источник.
        if (row.quizzes && !existing.sources.some((s) => s.id === row.quizzes!.id)) {
          existing.sources.push({
            id: row.quizzes.id,
            title: row.quizzes.title ?? "",
          });
        }
        continue;
      }

      byKey.set(key, {
        id: q.id,
        text: q.text,
        type: q.type ?? "single",
        points: row.points ?? 1,
        imageUrl: q.image_url,
        createdAt: q.created_at,
        answers: (q.answer_options ?? []).map((a) => ({
          text: a.text ?? "",
          isCorrect: !!a.is_correct,
          imageUrl: a.image_url,
        })),
        sources: row.quizzes
          ? [{ id: row.quizzes.id, title: row.quizzes.title ?? "" }]
          : [],
      });
    }

    const all = [...byKey.values()];

    // Фасеты считаем до фильтров — список тестов в выпадашке не должен
    // «схлопываться» по мере набора поискового запроса.
    const quizFacets = new Map<string, { id: string; title: string; count: number }>();
    for (const item of all) {
      for (const source of item.sources) {
        const facet = quizFacets.get(source.id);
        if (facet) facet.count += 1;
        else quizFacets.set(source.id, { ...source, count: 1 });
      }
    }

    const filtered = all.filter((item) => {
      if (type && item.type !== type) return false;
      if (quizId && !item.sources.some((s) => s.id === quizId)) return false;
      if (search) {
        const inText = item.text.toLowerCase().includes(search);
        const inAnswers = item.answers.some((a) =>
          a.text.toLowerCase().includes(search),
        );
        if (!inText && !inAnswers) return false;
      }
      return true;
    });

    return res.json({
      items: filtered.slice(offset, offset + limit),
      total: filtered.length,
      quizzes: [...quizFacets.values()].sort((a, b) =>
        a.title.localeCompare(b.title),
      ),
    });
  } catch (error) {
    console.error("Ошибка в getQuestionBank:", error);
    return res.status(500).json({ error: "Ошибка загрузки банка вопросов" });
  }
};
