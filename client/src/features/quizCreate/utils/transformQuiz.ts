import type { Answer, Question, QuizFormValues } from "../types";

const formatDateForInput = (dateValue: string | Date | null) => {
  if (!dateValue) return null;

  try {
    const d = new Date(dateValue);

    // Проверка на Invalid Date
    if (isNaN(d.getTime())) return null;

    // Сдвигаем время на ваш локальный часовой пояс
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());

    // Обрезаем до миллисекунд и вытаскиваем первые 16 символов (YYYY-MM-DDTHH:mm)
    return d.toISOString().slice(0, 16);
  } catch (e) {
    console.error(e);
    return null;
  }
};

export const transformQuiz = (data: QuizFormValues, published: boolean) => ({
  title: data.title.trim(),

  passing: Number(data.passing) || 0,
  timeLimit: Number(data.timeLimit) || 0,
  attemptLimit: Number(data.attemptLimit) || 0,
  published,
  assignedGroups: data.assignedGroups || [],
  assignedStudents: data.assignedStudents || [],
  startDate: data.startDate || null,
  dueDate: data.dueDate || null,
  questionsLimit: Number(data.questionsLimit),

  // Безопасный доступ к массиву вопросов
  questions: (data.questions || []).map((q: Question, qIndex: number) => {
    const isTextType = q.type === "text";

    return {
      text: q.text.trim(),
      type: q.type,
      points: Number(q.points) || 1, // Минимум 1 балл по умолчанию
      order: qIndex,

      // Если тип текстовый — отдаем пустой массив,
      // иначе мапим ответы, фильтруя пустые записи (на всякий случай)
      answers: isTextType
        ? []
        : (q.answers || [])
            .filter((a: Answer) => a.text?.trim() !== "") // Убираем пустые ответы
            .map((a: Answer) => ({
              text: a.text.trim(),
              isCorrect: !!a.isCorrect,
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
    attemptLimit: Number(data.attemptLimit),
    passing: Number(data.passing),
    published: published, // Берем статус прямо из формы!
    questionsLimit: data.questionsLimit,

    // Даты: если строка пустая, отправляем null (чтобы БД не ругалась)
    startDate: data.startDate || null,
    dueDate: data.dueDate || null,

    // Доступы
    assignedGroups: data.assignedGroups || [],
    assignedStudents: data.assignedStudents || [],

    // Вопросы
    questions: data.questions.map((q) => ({
      // ID передавать не обязательно, так как бэкенд по правилу "Исторической справедливости" (Вариант Б)
      // всё равно создаст новые записи в БД, чтобы не сломать старые попытки студентов.
      text: q.text.trim(),
      type: q.type,
      points: Number(q.points),
      answers: (q.answers || []).map((a) => ({
        text: a.text.trim(),
        isCorrect: Boolean(a.isCorrect),
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
    attempt_limit: number; // 🔥 Змеиный регистр (как в БД)
    published: boolean;
    questionsLimit: number;
  };
  questions: Array<{
    questionId: string;
    base_question_id: string;
    text: string;
    type: "single" | "multiple" | "text";
    points: number;
    answers: Array<{
      answerId: string;
      text: string;
      isCorrect: boolean;
    }>;
  }>;
  assignedGroups: string[];
  assignedStudents: string[];
  start_date: string | null;
  due_date: string | null;
}

export const transformBackendToForm = (
  serverData: QuizBackendResponse,
): QuizFormValues => {
  return {
    title: serverData.quiz.title,
    passing: Number(serverData.quiz.passing),
    timeLimit: serverData.quiz.time_limit, // snake_case -> camelCase
    attemptLimit: serverData.quiz.attempt_limit, // snake_case -> camelCase
    published: serverData.quiz.published,
    questionsLimit: serverData.quiz.questionsLimit,

    // Дата и группы (пока ставим пустые/null, если бэкенд их еще не отдает)
    assignedGroups: serverData.assignedGroups || [],
    assignedStudents: serverData.assignedStudents || [],
    startDate: formatDateForInput(serverData.start_date),
    dueDate: formatDateForInput(serverData.due_date),

    // Разворачиваем вопросы
    questions: (serverData.questions || []).map((q) => ({
      questionId: q.questionId, // сохраняем ID для режима редактирования
      text: q.text,
      type: q.type,
      points: q.points,
      answers: (q.answers || []).map((opt) => ({
        id: opt.answerId, // 🔥 И ID ответа тоже
        text: opt.text,
        isCorrect: opt.isCorrect, // snake_case -> camelCase
      })),
    })),
  };
};
