import { api } from "@/shared/api/axios";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import type { SubmitQuizBody, SubmitQuizResponse } from "../types";
import type { AxiosError } from "axios";
import { useTranslation } from "react-i18next";

interface BackendErrorResponse {
  error: string;
}

export const getQuizTaking = async (quizId: string) => {
  const res = await api.get(`/api/quiz/${quizId}`);
  return res.data;
};

export const getTakingQuizById = async (quizId: string) => {
  const res = await api.get(`/api/get-quiz-by-id/${quizId}`);
  return res.data;
};

export const submitQuizAttempt = async (data: SubmitQuizBody) => {
  const res = await api.post<SubmitQuizResponse>(
    "/api/quiz-taking/submit",
    data,
  );
  return res.data;
};

export function useSubmitQuiz() {
  const { t } = useTranslation();
  return useMutation<
    SubmitQuizResponse,
    AxiosError<BackendErrorResponse>,
    SubmitQuizBody
  >({
    mutationFn: submitQuizAttempt,
    onError: (error) => {
      // Теперь TypeScript знает, что у error есть .response.data.error
      // Никаких (error as any)!
      const msg = error.response?.data?.error || t("quizTaking.submitError");
      toast.error(msg);
    },
  });
}
