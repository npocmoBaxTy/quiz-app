import { useTestStore } from "@/pages/QuizTaking/store/store";
import { AnswerItem } from "./AnswerItem";

export function QuestionOptions() {
  const questions = useTestStore((s) => s.questions);
  const qIndex = useTestStore((s) => s.currentIndex);

  if (!questions[0]) return null;

  return (
    <div className="question__options--wrapper">
      <AnswerItem question={questions[qIndex]} />
    </div>
  );
}
