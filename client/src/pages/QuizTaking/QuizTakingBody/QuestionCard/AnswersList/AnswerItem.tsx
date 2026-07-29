import type { Question } from "./../../../types";
import { FreeTypeAnswer } from "./FreeTypeAnswer";
import { MultipleTypeAnswer } from "./MultipleTypeAnswer";
import { SingleTypeAnswer } from "./SingleTypeAnswer";

type Props = {
  question: Question;
};

export function AnswerItem({ question }: Props) {
  switch (question.type) {
    case "single":
      return (
        <SingleTypeAnswer
          questionId={question.id}
          options={question.options || []}
        />
      );

    case "multiple":
      return (
        <MultipleTypeAnswer
          questionId={question.id}
          options={question.options || []}
        />
      );

    case "text":
      return <FreeTypeAnswer questionId={question.id} />;

    default:
      return null;
  }
}
