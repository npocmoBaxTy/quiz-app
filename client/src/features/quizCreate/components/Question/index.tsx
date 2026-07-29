import { memo } from "react"; // Не забываем импорт
import { QuestionBody } from "./QuestionBody/QuestionBody";
import { QuestionFooter } from "./QuestionFooter/QuestionFooter";
import { QuestionHeader } from "./QuestionHeader/QuestionHeader";

type Props = {
  qIndex: number;
};

export const QuestionItem = memo(({ qIndex }: Props) => {
  return (
    <div className="question__item--wrapper ">
      <div className="rounded-md border border-zinc-400 mb-5">
        <QuestionHeader qIndex={qIndex} />
        <QuestionBody qIndex={qIndex} />
        <QuestionFooter qIndex={qIndex} />
      </div>
    </div>
  );
});

// Обязательно даем имя для DevTools
QuestionItem.displayName = "QuestionItem";
