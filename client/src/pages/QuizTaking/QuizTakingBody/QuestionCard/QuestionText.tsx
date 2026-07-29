import { useTestStore } from "../../store/store";

export function QuestionText() {
  const questions = useTestStore((s) => s.questions);
  const qIndex = useTestStore((s) => s.currentIndex);
  return (
    <div className="question__title--wrapper flex items-start font-semibold text-lg text-slate-700 mb-4">
      <p className="mr-1">{qIndex + 1}.</p>
      <p className="break-all">{questions[qIndex]?.text}</p>
    </div>
  );
}
