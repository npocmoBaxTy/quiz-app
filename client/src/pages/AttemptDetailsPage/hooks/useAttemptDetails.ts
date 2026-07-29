// hooks/useAttemptQueries.ts (или где у вас лежат хуки)
import { useQuery } from "@tanstack/react-query";
import { api } from "@/shared/api/axios"; // ваш путь к axios

export const useGetAttemptDetails = (attemptId: string | undefined) => {
  return useQuery({
    queryKey: ["attempt-details", attemptId],
    queryFn: async () => {
      // Тот самый правильный путь, который мы вычислили!
      const { data } = await api.get(
        `/api/attempts/student-attempt/${attemptId}`,
      );
      return data;
    },
    enabled: !!attemptId,
  });
};
