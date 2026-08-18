import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";

import { api } from "@/shared/api/axios";

export function useDeleteQuiz() {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: async (quizId: string) => {
      const res = await api.delete(`/api/teacher/quizzes/${quizId}`);
      return res.data;
    },
    onSuccess: (_, quizId) => {
      queryClient.invalidateQueries({ queryKey: ["quizzes"] });
      queryClient.invalidateQueries({ queryKey: ["recent-attempts"] });
      queryClient.removeQueries({ queryKey: ["edit-quiz", quizId] });
      toast.success(t("teacherQuizzes.delete.success"));
    },
    onError: (error: AxiosError<{ error?: string }>) => {
      toast.error(error.response?.data?.error || t("teacherQuizzes.delete.error"));
    },
  });
}
