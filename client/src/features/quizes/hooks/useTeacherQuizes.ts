import { useQuery } from "@tanstack/react-query";
import { getTeacherQuizes } from "./../api/getTeacherQuizes";

export function useMyQuizzes() {
  return useQuery({
    queryKey: ["my-quizzes"],
    queryFn: getTeacherQuizes,
  });
}
