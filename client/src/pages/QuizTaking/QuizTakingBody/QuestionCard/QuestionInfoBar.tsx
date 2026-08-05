import { Flag } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useTestStore } from "../../store/store";

export function QuestionInfoBar() {
  const { t } = useTranslation();
  const questions = useTestStore((s) => s.questions);
  const currentIndex = useTestStore((s) => s.currentIndex);
  const flagged = useTestStore((s) => s.flagged);
  const toggleFlag = useTestStore((s) => s.toggleFlag);

  const question = questions[currentIndex];
  const isFlagged = question ? !!flagged[question.id] : false;

  return (
    <div className="flex items-center justify-between mb-5">
      <span className="inline-flex items-center gap-2 px-3 py-1 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold text-slate-700">
        {t("quizTaking.questionCounter", { current: currentIndex + 1, total: questions.length })}
      </span>

      <button
        type="button"
        onClick={() => question && toggleFlag(question.id)}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors border ${
          isFlagged
            ? "bg-amber-50 text-amber-700 border-amber-200"
            : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50 hover:text-slate-800"
        }`}
      >
        <Flag size={16} fill={isFlagged ? "currentColor" : "none"} />
        <span className="hidden sm:inline">
          {isFlagged ? t("quizTaking.flag.marked") : t("quizTaking.flag.mark")}
        </span>
      </button>
    </div>
  );
}
