import { useQuery } from "@tanstack/react-query";
import { api } from "@/shared/api/axios";
import type { AttemptDetails } from "../types"; // Путь до ваших типов

// Обновляем функции запроса:
export const getAttemptDetails = async (
  attemptId: string,
  page: number,
): Promise<AttemptDetails> => {
  const res = await api.get(
    `/api/student/attempt/${attemptId}?page=${page}&limit=10`,
  );
  return res.data;
};

export function useAttemptDetails(attemptId: string | undefined, page: number) {
  return useQuery({
    queryKey: ["attempt-details", attemptId, page], // 🔥 Кэшируем каждую страницу отдельно
    queryFn: () => getAttemptDetails(attemptId!, page),
    enabled: !!attemptId,
  });
}
