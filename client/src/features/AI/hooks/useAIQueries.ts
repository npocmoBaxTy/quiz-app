import { useMutation } from "@tanstack/react-query";
import { api } from "@/shared/api/axios"; // Убедитесь, что путь к вашему axios правильный

interface GeneratePayload {
  topic: string;
  difficulty: string;
  count: number;
}

// Тип того, что возвращает ИИ
export interface GeneratedQuestion {
  text: string;
  type: "single" | "multiple";
  points: number;
  options: {
    text: string;
    isCorrect: boolean;
  }[];
}

export const useGenerateQuestions = () => {
  return useMutation({
    mutationFn: async (payload: GeneratePayload): Promise<GeneratedQuestion[]> => {
      const { data } = await api.post("/api/ai/generate-questions", payload);
      return data;
    }
  });
};