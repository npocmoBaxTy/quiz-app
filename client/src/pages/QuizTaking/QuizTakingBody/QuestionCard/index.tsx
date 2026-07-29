import { QuestionOptions } from "./AnswersList";
import { QuestionText } from "./QuestionText";

export function QuestionBody() {
  return (
    <div className="question__body--wrapper">
      <QuestionText />
      <QuestionOptions />
    </div>
  );
}
