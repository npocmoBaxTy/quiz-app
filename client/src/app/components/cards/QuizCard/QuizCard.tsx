import { useStartQuiz } from "@/pages/QuizesListPage/hooks/useGetQuizzesList";
import { formatQuizDate } from "@/pages/TeacherQuizesPage/hooks/formateDate";
import type { Quiz } from "@/pages/TeacherQuizesPage/types";
import { Check, Clock, ScrollText } from "lucide-react";
import { useTranslation } from "react-i18next";

type Props = {
  quiz: Quiz;
  clickHandler?: () => void;
};

export const QuizesCard = ({ quiz, clickHandler }: Props) => {
  const { t } = useTranslation();
  const startMutation = useStartQuiz();

  return (
    <div
      className="test-card bg-white border duration-500 hover:shadow-xl border-slate-200 rounded-[2rem] 
                p-4 sm:p-6 flex flex-col w-full"
    >
      <div className="flex items-center gap-2 mb-4">
        <div className="flex animate-pulse justify-center items-center w-6 h-6 rounded-full bg-(--main-blue) text-white">
          <Check size={15} />
        </div>

        <span className="mt-1 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider status-badge-active">
          {t("quizCard.active")}
        </span>
      </div>

      <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-2 line-clamp-2">
        {quiz.title}
      </h3>

      <p className="text-slate-500 text-sm mb-6 grow">{quiz.creator_name}</p>

      <div className="flex flex-wrap items-center gap-3 sm:gap-4 mb-6 text-xs text-slate-500 font-medium">
        <div className="flex items-center gap-1.5">
          <Clock className="text-blue-500" size={15} /> {quiz.time_limit}{" "}
          {t("quizCard.time")}
        </div>

        <div className="flex items-center gap-1.5">
          <ScrollText className="text-purple-500" size={15} />{" "}
          {quiz.questions_limit} {t("quizCard.questions")}
        </div>
      </div>

      <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-[10px] uppercase font-bold text-slate-400">
            {t("quizCard.deadline")}
          </p>
          <p className="text-sm font-bold text-slate-700">
            {formatQuizDate(quiz.dueDate)}
          </p>
        </div>

        <button
          onClick={clickHandler}
          type="button"
          className="w-full sm:w-auto text-center px-5 py-2.5 bg-(--main-blue) text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-all"
        >
          {startMutation.isPending ? "Загрузка..." : t("quizCard.start")}
        </button>
      </div>
    </div>
  );
};
