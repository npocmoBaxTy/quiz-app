import { useQuery } from "@tanstack/react-query";
import { getQuizTaking, getTakingQuizById } from "../api/api";
import type { Question, TakingQuiz } from "../types";

type QuizResponse = {
  questions: Question[];
};

// api/quiz.ts
export function useQuizTaking(quizId: string) {
  return useQuery<QuizResponse>({
    queryKey: ["quiz", quizId],
    queryFn: () => getQuizTaking(quizId),
    enabled: !!quizId,
  });
}

export function useQuizTakingById(quizId: string) {
  return useQuery<TakingQuiz>({
    queryKey: ["quiz-by-id", quizId],
    queryFn: () => getTakingQuizById(quizId),
    enabled: !!quizId,
  });
}
