// hooks/useAttemptQueries.ts
import { useQuery } from "@tanstack/react-query";
import { getAttemptDetails, getQuizAttempts } from "../api/api";

export const useGetAttemptDetails = (attemptId: string | undefined) => {
  return useQuery({
    // Ключ кеша. Если attemptId изменится, запрос выполнится заново
    queryKey: ["attemptDetails", attemptId],

    // Сама функция запроса. Используем "!", т.к. мы гарантируем наличие ID благодаря 'enabled'
    queryFn: () => getAttemptDetails(attemptId!),

    // Запускаем запрос ТОЛЬКО если attemptId существует
    enabled: !!attemptId,

    // Можно настроить время жизни кеша, чтобы не дергать базу лишний раз
    staleTime: 5 * 60 * 1000, // 5 минут данные считаются свежими
  });
};

export const useGetQuizAttempts = (quizId: string | undefined) => {
  return useQuery({
    queryKey: ["quiz-attempts", quizId],
    queryFn: () => getQuizAttempts(quizId!),
    enabled: !!quizId,
  });
};
