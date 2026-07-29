import { useTestStore } from "../store/store";
import { QuizProgressBar } from "./ProgressBar";
import { QuestionTitle } from "./Title";

export function QuestionHeader() {
  const quiz = useTestStore((s) => s.quiz);
  const questions = useTestStore((s) => s.questions);
  return (
    <div className="question__card--header">
      <QuestionTitle title={quiz.title} />
      <QuizProgressBar questions={questions.length} />
    </div>
  );
}
