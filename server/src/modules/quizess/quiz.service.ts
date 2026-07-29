import { getQuizzesByTeacher } from "./quiz.repository.js";

export async function listMyQuizzes(userId: string) {
  return getQuizzesByTeacher(userId);
}
