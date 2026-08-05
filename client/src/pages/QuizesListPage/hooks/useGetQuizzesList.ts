import { useMutation, useQuery } from "@tanstack/react-query";
import { getQuizesList } from "./../api/getQuizesList";
import { startQuizAttempt } from "../api/getQuizesList";
import toast from "react-hot-toast";
import type { AxiosError } from "axios";
import { useTranslation } from "react-i18next";

export interface StartQuizResponse {
  success: boolean;
  attemptId: string;
}

// 2. Описываем формат ошибки (помните, в контроллере мы еще передавали maxAttempts?)
export interface BackendErrorResponse {
  error: string;
  maxAttempts?: number;
}

export const useStudentQuizzesList = () => {
  return useQuery({
    queryKey: ["quizzesList"],
    queryFn: getQuizesList,
    staleTime() {
      return 1000 * 60 * 20; // 20 минут
    },
  });
};

export function useStartQuiz() {
  const { t } = useTranslation();
  // Передаем 3 дженерика: <Тип_успеха, Тип_ошибки, Тип_аргумента(quizId)>
  return useMutation<
    StartQuizResponse,
    AxiosError<BackendErrorResponse>,
    string
  >({
    mutationFn: startQuizAttempt,
    onError: (error) => {
      const msg = error.response?.data?.error || t("resultsList.startFailed");
      toast.error(msg);
    },
  });
}
