import { BookOpen } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useTestStore } from "../store/store";
import { QuizProgressBar } from "./ProgressBar";
import { Timer } from "./Timer";

interface Props {
  onFinishClick: () => void;
}

export function QuestionHeader({ onFinishClick }: Props) {
  const { t } = useTranslation();
  const quiz = useTestStore((s) => s.quiz);
  const questions = useTestStore((s) => s.questions);

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 h-16 sm:h-20 flex items-center justify-between px-4 sm:px-8 shadow-sm">
      <div className="flex items-center gap-4 min-w-0">
        <div className="hidden sm:flex items-center justify-center w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 shrink-0">
          <BookOpen size={18} />
        </div>
        <div className="min-w-0">
          <h1 className="font-bold text-slate-800 text-sm sm:text-base leading-tight truncate max-w-[150px] sm:max-w-md">
            {quiz.title}
          </h1>
          <p className="text-xs text-slate-500">
            {t("quizTaking.ticketLabel", { count: questions.length })}
          </p>
        </div>
      </div>

      <QuizProgressBar questions={questions.length} />

      <div className="flex items-center gap-3 sm:gap-6">
        <Timer />
        <button
          onClick={onFinishClick}
          className="hidden sm:flex items-center gap-2 bg-slate-900 hover:bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-semibold transition-all shadow-sm active:scale-95 text-sm"
        >
          {t("quizTaking.footer.finishTest")}
        </button>
      </div>
    </header>
  );
}
