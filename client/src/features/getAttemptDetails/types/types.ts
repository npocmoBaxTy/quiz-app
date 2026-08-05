// types/attempt.ts

// Вариант ответа
export interface AttemptOption {
  id: string;
  text: string;
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

// Ответ студента на конкретный вопрос
export interface AttemptAnswer {
  answerId: string;
  questionId: string;
  questionText: string;
  questionType: "single" | "multiple" | "text"; // Ваши типы вопросов
  points: number;
  isCorrect: boolean;
  selectedOptionId: string | null;
  textAnswer: string | null;
  options?: AttemptOption[]; // Опционально, т.к. для текстовых вопросов их нет
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
