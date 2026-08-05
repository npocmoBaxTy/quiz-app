import { QuestionOptions } from "./AnswersList";
import { QuestionInfoBar } from "./QuestionInfoBar";
import { QuestionText } from "./QuestionText";

export function QuestionBody() {
  return (
    <div className="question__body--wrapper">
      <QuestionInfoBar />
      <div className="bg-white rounded-[24px] border border-slate-200 shadow-sm p-6 sm:p-8 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-indigo-500 via-purple-500 to-indigo-500 opacity-20"></div>
        <QuestionText />
        <QuestionOptions />
      </div>
    </div>
  );
}
