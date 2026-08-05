import type { Answer, Question, QuizFormValues } from "../types";

export const transformQuiz = (data: QuizFormValues, published: boolean) => ({
  title: data.title.trim(),

  passing: Number(data.passing) || 0,
  timeLimit: Number(data.timeLimit) || 0,
  published,
  questionsLimit: Number(data.questionsLimit),

  // Безопасный доступ к массиву вопросов
  questions: (data.questions || []).map((q: Question, qIndex: number) => {
    const isTextType = q.type === "text";

    return {
      text: q.text.trim(),
      type: q.type,
      points: Number(q.points) || 1, // Минимум 1 балл по умолчанию
      order: qIndex,
      imageUrl: q.imageUrl || undefined,

      // Если тип текстовый — отдаем пустой массив,
      // иначе мапим ответы, фильтруя пустые записи (на всякий случай)
      answers: isTextType
        ? []
        : (q.answers || [])
            .filter((a: Answer) => a.text?.trim() !== "") // Убираем пустые ответы
            .map((a: Answer) => ({
              text: a.text.trim(),
              isCorrect: !!a.isCorrect,
              imageUrl: a.imageUrl || undefined,
            })),
    };
  }),
});

export const transformQuizToBackend = (
  data: QuizFormValues,
  published: boolean,
) => {
  return {
    title: data.title.trim(),
    timeLimit: Number(data.timeLimit),
    passing: Number(data.passing),
    published: published, // Берем статус прямо из формы!
    questionsLimit: data.questionsLimit,

    // Вопросы
    questions: data.questions.map((q) => ({
      // ID передавать не обязательно, так как бэкенд по правилу "Исторической справедливости" (Вариант Б)
      // всё равно создаст новые записи в БД, чтобы не сломать старые попытки студентов.
      text: q.text.trim(),
      type: q.type,
      points: Number(q.points),
      imageUrl: q.imageUrl || undefined,
      answers: (q.answers || []).map((a) => ({
        text: a.text.trim(),
        isCorrect: Boolean(a.isCorrect),
        imageUrl: a.imageUrl || undefined,
      })),
    })),
  };
};

// types.ts (или где у вас лежат интерфейсы)
export interface QuizBackendResponse {
  success: true;
  quiz: {
    id: string;
    title: string;
    passing: number;
    time_limit: number; // 🔥 Змеиный регистр (как в БД)
    published: boolean;
    questionsLimit: number;
  };
  questions: Array<{
    questionId: string;
    base_question_id: string;
    text: string;
    type: "single" | "multiple" | "text";
    points: number;
    imageUrl?: string | null;
    answers: Array<{
      answerId: string;
      text: string;
      isCorrect: boolean;
      imageUrl?: string | null;
    }>;
  }>;
}

export const transformBackendToForm = (
  serverData: QuizBackendResponse,
): QuizFormValues => {
  return {
    title: serverData.quiz.title,
    passing: Number(serverData.quiz.passing),
    timeLimit: serverData.quiz.time_limit, // snake_case -> camelCase
    published: serverData.quiz.published,
    questionsLimit: serverData.quiz.questionsLimit,

    // Разворачиваем вопросы
    questions: (serverData.questions || []).map((q) => ({
      questionId: q.questionId, // сохраняем ID для режима редактирования
      text: q.text,
      type: q.type,
      points: q.points,
      imageUrl: q.imageUrl || undefined,
      answers: (q.answers || []).map((opt) => ({
        id: opt.answerId, // 🔥 И ID ответа тоже
        text: opt.text,
        isCorrect: opt.isCorrect, // snake_case -> camelCase
        imageUrl: opt.imageUrl || undefined,
      })),
    })),
  };
};
