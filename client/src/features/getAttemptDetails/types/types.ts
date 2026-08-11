// types/attempt.ts

// Вариант ответа
export interface AttemptOption {
  id: string;
  text: string | null;
  imageUrl: string | null;
  isCorrect: boolean;
}

export interface QuizAttemptListItem {
  id: string;
  studentName: string;
  score: number;
  status: string;
  finishedAt: string;
  /** Сдано после истечения лимита времени (считается сервером) */
  isLate: boolean;
  overtimeSeconds: number;
}

// Разбор одного вопроса билета. Одна запись на вопрос, даже если студент
// выбрал несколько вариантов или не ответил вовсе.
export interface AttemptAnswer {
  questionId: string;
  questionText: string | null;
  questionType: "single" | "multiple" | "text" | null;
  questionImageUrl: string | null;
  /** Набрано за вопрос */
  points: number;
  /** Максимум за вопрос по билету; null у попыток, сданных до фиксации билета */
  maxPoints: number | null;
  isCorrect: boolean | null;
  /** Вопрос был в билете, но студент его не тронул */
  isSkipped: boolean;
  textAnswer: string | null;
  /** Все выбранные студентом варианты */
  selectedOptionIds: string[];
  options?: AttemptOption[]; // Для текстовых вопросов их нет
}

// Данные о самой попытке
export interface AttemptInfo {
  id: string;
  score: number;
  status: string;
  full_name: string;
  startedAt: string | null;
  finishedAt: string | null;
  /** Сдано после истечения лимита времени (считается сервером) */
  isLate: boolean;
  overtimeSeconds: number;
}

// Главный ответ от сервера
export interface AttemptDetailsResponse {
  attempt: AttemptInfo;
  answers: AttemptAnswer[];
}
