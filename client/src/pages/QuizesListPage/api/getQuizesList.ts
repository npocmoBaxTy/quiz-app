import { api } from "@/shared/api/axios";
import type { Quiz } from "../types";

export async function getQuizesList() {
  const data = await api.get<Quiz[]>("/api/quizes-student/student-list");
  return data.data;
}

export const startQuizAttempt = async (quizId: string) => {
  const res = await api.post<{ success: boolean; attemptId: string }>(
    "/api/attempt/start",
    { quizId },
  );
  return res.data;
};
