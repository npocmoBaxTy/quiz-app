import { useQuery } from "@tanstack/react-query";
import { getQuizzesRequest } from "../api/getQuizes";

export const useQuizzes = () => {
  return useQuery({
    queryKey: ["quizzes"],
    queryFn: getQuizzesRequest,
  });
};
