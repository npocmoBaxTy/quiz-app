// api/teacher.api.ts
import { api } from "@/shared/api/axios"; // Путь к вашему axios
import {
  type AttemptDetailsResponse,
  type QuizAttemptListItem,
} from "./../types/types";

// Функция получения деталей попытки
export const getAttemptDetails = async (
  attemptId: string,
): Promise<AttemptDetailsResponse> => {
  // Убедитесь, что URL совпадает с вашим роутером на бекенде!
  const response = await api.get(`/api/attempts/student-attempt/${attemptId}`);
  return response.data;
};

export const getQuizAttempts = async (
  quizId: string,
): Promise<QuizAttemptListItem[]> => {
  const { data } = await api.get(`/api/attempts/quizzes/${quizId}/attempts`);
  return data;
};
