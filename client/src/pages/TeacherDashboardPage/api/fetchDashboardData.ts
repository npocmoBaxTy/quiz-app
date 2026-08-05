// src/shared/api/attempts.ts

import { api } from "@/shared/api/axios";

// --- ТИПЫ ДАННЫХ ИЗ ВАШЕЙ БД ---
export interface AttemptFeedItem {
  id: string;
  studentName: string;
  quizTitle: string;
  score: number;
  status: "in_progress" | "completed" | "needs_grading";
  finishedAt: string;
  passing: number;
  /** Сдано после истечения лимита времени (считается сервером) */
  isLate: boolean;
  overtimeSeconds: number;
}

export interface StudentAnswer {
  id: string;
  questionText: string;
  questionType: "single" | "multiple" | "text";
  isCorrect: boolean;
  points: number;
  // Для тестов:
  selectedOptionText?: string;
  // Для текстовых вопросов (эссе):
  textAnswer?: string;
}

export interface AttemptDetails {
  attempt: {
    id: string;
    score: number;
    status: string;
    fullName: string;
  };
  answers: StudentAnswer[];
}

// --- ФУНКЦИИ ЗАПРОСОВ ---
export const fetchRecentAttempts = async (): Promise<AttemptFeedItem[]> => {
  const { data } = await api.get("/api/attempts/recent-attempts");
  return data;
};

export const fetchAttemptDetails = async (
  attemptId: string,
): Promise<AttemptDetails> => {
  const { data } = await api.get(`/api/attempts/get-attempt/${attemptId}`);
  return data;
};

// Функция для ручной проверки эссе (если препод ставит баллы за text_answer)
export const gradeStudentAnswer = async ({
  answerId,
  points,
  isCorrect,
}: {
  answerId: string;
  points: number;
  isCorrect: boolean;
}) => {
  const { data } = await api.patch(
    `/api/attempts/student-answers/${answerId}/grade`,
    {
      points,
      isCorrect,
    },
  );
  return data;
};
