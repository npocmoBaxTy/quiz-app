import { useMutation } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { createQuizApi } from "../../api/creatQuiz";

export const useCreateQuiz = () => {
  return useMutation({
    mutationFn: createQuizApi,

    onSuccess: () => {
      toast.success("Тест успешно создан");
    },

    onError: (error) => {
      toast.error(error.message || "Ошибка");
    },
  });
};
