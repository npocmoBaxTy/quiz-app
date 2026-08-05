import { useTestStore } from "../store/store";
import { useTranslation } from "react-i18next";

export function QuizProgressBar({ questions }: { questions: number }) {
  const answeredCount = useTestStore((s) => s.getAnsweredCount());
  const { t } = useTranslation();
  const percentage = questions === 0 ? 0 : Math.min((answeredCount / questions) * 100, 100);

  return (
    <div className="hidden md:flex flex-col items-center flex-1 max-w-sm mx-8">
      <div className="flex justify-between w-full text-xs font-bold mb-1.5 text-slate-500">
        <span id="question-counter">{t("quizTaking.solved", { count: answeredCount })}</span>
        <span id="progress-percentage">{percentage.toFixed(0)}%</span>
      </div>
      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
        <div
          id="progress-bar"
          className="h-full bg-emerald-500 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
}
