import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/shared/api/axios/index";

// --- ТИПЫ ---
interface Group {
  id: string;
  name: string;
}
interface Student {
  id: string;
  full_name: string;
  groupName: string;
}

// --- ХУК: Получение списков ---
export const useGroupsAndStudents = () => {
  return useQuery({
    queryKey: ["assignable-users"],
    queryFn: async () => {
      // Запрашиваем списки с вашего бэкенда (создайте такой эндпоинт)
      const { data } = await api.get<{
        groups: Group[];
        students: Student[];
      }>("/api/teacher/assignable-users");
      return data;
    },
  });
};

// --- ХУК: Отправка назначения ---
export const useAssignQuizMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: {
      quizId: string;
      groupIds: string[];
      studentIds: string[];
      startDate: string;
      dueDate: string;
    }) => {
      const { data } = await api.post("/api/create-quiz", payload);
      return data;
    },
    onSuccess: () => {
      // Можно инвалидировать запросы, чтобы обновить дашборд
      queryClient.invalidateQueries({ queryKey: ["teacher-quizzes"] });
    },
  });
};
