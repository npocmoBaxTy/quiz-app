import { useStartQuiz } from "@/pages/QuizesListPage/hooks/useGetQuizzesList";
import type { Quiz } from "@/pages/QuizesListPage/types";
import { ArrowRight, Clock, HelpCircle, Infinity, Target, User } from "lucide-react";
import { useTranslation } from "react-i18next";

type Props = {
  quiz: Quiz;
  clickHandler?: () => void;
};

export const QuizesCard = ({ quiz, clickHandler }: Props) => {
  const { t } = useTranslation();
  const startMutation = useStartQuiz();

  const isUnlimited = !quiz.attempt_limit;
  const attemptsLeft = isUnlimited ? null : quiz.attempt_limit! - quiz.used_attempts;

  return (
    <div className="flex flex-col bg-white border border-slate-200 rounded-2xl p-5 hover:shadow-xl hover:border-indigo-200 transition-all duration-300 group relative overflow-hidden w-full">

      {/* Декоративный блик при наведении */}
      <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-indigo-500 to-violet-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>

      {/* Шапка карточки */}
      <div className="flex justify-between items-start mb-4 gap-4">
        <h3 className="text-lg font-bold text-slate-800 leading-snug line-clamp-2 group-hover:text-indigo-600 transition-colors">
          {quiz.title}
        </h3>
        <span className="bg-indigo-50 text-indigo-600 text-[11px] font-bold px-2 py-1 rounded-md whitespace-nowrap border border-indigo-100 shrink-0">
          {t("quizCard.passingLabel", { percent: quiz.passing })}
        </span>
      </div>

      {/* Автор */}
      <div className="flex items-center gap-2 text-sm text-slate-500 font-medium mb-5">
        <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
          <User size={12} />
        </div>
        <span className="truncate">{quiz.creator_name || t("quizCard.teacherFallback")}</span>
      </div>

      {/* Характеристики */}
      <div className="grid grid-cols-2 gap-2 text-xs font-semibold text-slate-600 mb-6">
        <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-lg border border-slate-100">
          <Clock size={14} className="text-slate-400" />
          <span>{quiz.time_limit} {t("quizCard.time")}</span>
        </div>
        <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-lg border border-slate-100">
          <HelpCircle size={14} className="text-slate-400" />
          <span>{quiz.questions_limit ?? "—"} {t("quizCard.questions")}</span>
        </div>
      </div>

      {/* Подвал с кнопкой и попытками */}
      <div className="mt-auto flex items-center justify-between pt-4 border-t border-slate-100">
        <div className="flex flex-col">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">
            {t("quizCard.attemptsLabel")}
          </span>

          {isUnlimited ? (
            <span className="flex items-center gap-1.5 font-bold text-emerald-600">
              <Infinity size={16} strokeWidth={2.5} />
              {t("quizCard.unlimited")}
            </span>
          ) : (
            <span className={`flex items-center gap-1.5 font-bold ${attemptsLeft! <= 1 ? "text-orange-500" : "text-slate-700"}`}>
              <Target size={14} />
              {t("quizCard.attemptsCount", { left: attemptsLeft, total: quiz.attempt_limit })}
            </span>
          )}
        </div>

        <button
          onClick={clickHandler}
          type="button"
          disabled={startMutation.isPending}
          className="flex items-center gap-2 bg-slate-900 hover:bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-semibold transition-all shadow-sm active:scale-95 disabled:opacity-60"
        >
          {startMutation.isPending ? t("studentHome.loading") : t("quizCard.start")}
          <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
};
