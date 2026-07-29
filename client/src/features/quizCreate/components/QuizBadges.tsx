import { Badge } from "@/app/components/ui/badge";
import { useFormContext } from "react-hook-form";
import type { Answer, Question } from "../types";

export function QuizBadges() {
  const form = useFormContext();

  // Возвращаем watch! Нам нужно следить за каждым символом и чекбоксом
  const questions = form.watch("questions") || [];

  // Вычисляем количество "готовых" вопросов
  const readyQuestionsCount = questions.filter((q: Question) => {
    if (!q.text || q.text.trim() === "") return false;
    if (!q.points || q.points <= 0) return false;

    if (q.type === "multiple") {
      if (!q.answers || q.answers.length === 0) return false;
      const hasCorrectAnswer = q.answers.some((ans: Answer) => ans.isCorrect);
      if (!hasCorrectAnswer) return false;
    }

    return true;
  }).length;

  const isAllReady =
    questions.length > 0 && readyQuestionsCount === questions.length;

  return (
    <div className="flex w-full flex-wrap justify-center gap-2">
      <Badge
        className={`text-xs transition-colors duration-300 ${
          isAllReady
            ? "bg-green-500 hover:bg-green-600"
            : "bg-orange-400 hover:bg-orange-500"
        }`}
      >
        {readyQuestionsCount}/{questions.length} Вопросов готово
      </Badge>
    </div>
  );
}
