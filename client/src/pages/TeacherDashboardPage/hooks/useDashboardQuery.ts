// src/features/attempts/hooks/useAttempts.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchRecentAttempts,
  fetchAttemptDetails,
  gradeStudentAnswer,
} from "./../api/fetchDashboardData";

// Ключи для кэша
export const ATTEMPTS_KEYS = {
  feed: ["recent-attempts"],
  details: (id: string) => ["attempt-details", id],
};

// 1. Хук для Дашборда (Живая лента)
export const useRecentAttempts = () => {
  return useQuery({
    queryKey: ATTEMPTS_KEYS.feed,
    queryFn: fetchRecentAttempts,
    // Можно добавить автообновление ленты раз в минуту
    refetchInterval: 60000,
  });
};

// 2. Хук для страницы проверки конкретной работы
export const useAttemptDetails = (attemptId: string) => {
  return useQuery({
    queryKey: ATTEMPTS_KEYS.details(attemptId),
    queryFn: () => fetchAttemptDetails(attemptId),
    enabled: !!attemptId, // Запрос не уйдет, пока нет ID
  });
};

// 3. Хук для оценки текстового ответа (эссе)
export const useGradeAnswerMutation = (attemptId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: gradeStudentAnswer,
    onSuccess: () => {
      // Обновляем данные на экране мгновенно после выставления оценки
      queryClient.invalidateQueries({
        queryKey: ATTEMPTS_KEYS.details(attemptId),
      });
    },
  });
};
