import { useTranslation } from "react-i18next";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTestStore } from "../store/store";

export function QuestionFooter() {
  const { t } = useTranslation();

  const next = useTestStore((s) => s.next);
  const prev = useTestStore((s) => s.prev);
  const currentIndex = useTestStore((s) => s.currentIndex);
  const totalQuestions = useTestStore((s) => s.questions.length);

  const isFirst = currentIndex === 0;
  const isLast = currentIndex === totalQuestions - 1;

  return (
    <div className="question__footer--wrapper mt-6 flex items-center justify-between w-full">
      <button
        onClick={prev}
        disabled={isFirst}
        className="flex items-center gap-2 px-5 py-3 rounded-xl font-semibold transition-colors text-slate-600 hover:bg-white hover:shadow-sm disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:shadow-none"
      >
        <ChevronLeft size={20} />
        {t("quizTaking.footer.previous")}
      </button>

      <button
        onClick={next}
        disabled={isLast}
        className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all shadow-sm active:scale-95 ${
          isLast
            ? "bg-slate-100 text-slate-400 cursor-not-allowed"
            : "bg-indigo-600 hover:bg-indigo-700 text-white"
        }`}
      >
        {t("quizTaking.footer.next")}
        <ChevronRight size={20} />
      </button>
    </div>
  );
}
