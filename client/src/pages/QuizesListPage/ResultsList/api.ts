import { api } from "@/shared/api/axios";
import { useQuery } from "@tanstack/react-query";
import type { QuizResult } from "../types";

// Обновляем тип ответа от сервера (теперь сервер возвращает не просто массив, а объект с метой)
export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    totalPages: number;
  };
}

// 1. Хук для результатов (Добавляем параметр page)
export const fetchStudentResults = async (
  page: number,
): Promise<PaginatedResponse<QuizResult>> => {
  const res = await api.get(`/api/student/results?page=${page}&limit=6`);
  return res.data;
};

export const useStudentResultsList = (page: number) => {
  return useQuery({
    // Важно: добавляем page в queryKey, чтобы кэш знал, какая это страница!
    queryKey: ["student-results", page],
    queryFn: () => fetchStudentResults(page),
  });
};
