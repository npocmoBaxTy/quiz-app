import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { api } from "@/shared/api/axios";
import type { QuestionBankParams, QuestionBankResponse } from "../types";

export function useQuestionBank(params: QuestionBankParams) {
  return useQuery<QuestionBankResponse>({
    queryKey: ["question-bank", params],
    queryFn: async () => {
      const res = await api.get("/api/question-bank", { params });
      return res.data;
    },
    // Список не должен схлопываться в спиннер при смене фильтра или страницы.
    placeholderData: keepPreviousData,
  });
}
