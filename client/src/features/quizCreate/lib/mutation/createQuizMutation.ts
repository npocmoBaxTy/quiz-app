import { useMutation } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { createQuizApi } from "../../api/creatQuiz";

export const useCreateQuiz = () => {
  const { t } = useTranslation();
  return useMutation({
    mutationFn: createQuizApi,

    onSuccess: () => {
      toast.success(t("quizBuilder.toastCreateSuccess"));
    },

    onError: (error) => {
      toast.error(error.message || t("quizBuilder.toastGenericError"));
    },
  });
};
