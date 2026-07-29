import toast from "react-hot-toast";

import { api } from "@/shared/api/axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios"; // 🔥 Добавляем импорт AxiosError

import type { QuizFormValues } from "../types";

export function useGetQuizForEdit(quizId?: string) {
  return useQuery({
    queryKey: ["edit-quiz", quizId],
    queryFn: async () => {
      const res = await api.get(`/api/teacher/quizzes/${quizId}/edit`);
      return res.data;
    },
    enabled: !!quizId,
  });
}

// --- 1. МУТАЦИЯ ДЛЯ СОЗДАНИЯ (POST) ---
export function useCreateQuiz() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: QuizFormValues) => {
      // При желании payload тоже можно типизировать, например как ReturnType<typeof transformQuiz>
      const res = await api.post("/api/create-quiz", payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quizzes"] });
      toast.success("Тест успешно создан!");
    },
    // 🔥 Заменили any на AxiosError
    onError: (error: AxiosError<{ error?: string }>) => {
      const msg = error.response?.data?.error || "Ошибка при создании теста";
      toast.error(msg);
    },
  });
}

// --- 2. МУТАЦИЯ ДЛЯ ОБНОВЛЕНИЯ (PUT) ---
export function useUpdateQuiz() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      quizId,
      payload,
    }: {
      quizId: string;
      payload: QuizFormValues; // Сюда прилетят трансформированные данные, готовые для БД
    }) => {
      const res = await api.put(`/api/teacher/quizzes/${quizId}`, payload);
      return res.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["quizzes"] });
      queryClient.invalidateQueries({
        queryKey: ["edit-quiz", variables.quizId],
      });
      toast.success("Изменения сохранены!");
    },
    // 🔥 Используем AxiosError вместо приведения к Error
    onError: (error: AxiosError<{ error?: string }>) => {
      const msg = error.response?.data?.error || "Ошибка при обновлении теста";
      toast.error(msg);
    },
  });
}
