import { Clock, ScrollText, Calendar, Check, FileWarning } from "lucide-react";
import { useTranslation } from "react-i18next";
import { NavLink } from "react-router-dom";
import { formatQuizDate } from "../hooks/formateDate";
import type { Quiz } from "../types";

export const PublishedCard = ({ quiz }: { quiz: Quiz }) => {
  const { t } = useTranslation();
  return (
    <div
      className={`test-card bg-white border ${quiz.published ? "border-(--success-green)" : "border-orange-400"} duration-500 hover:shadow-xl rounded-[2rem] p-4 sm:p-6 flex flex-col w-full`}
    >
      <div className="flex items-center gap-2 mb-4">
        <div
          className={`flex animate-pulse justify-center items-center w-6 h-6 rounded-full ${quiz.published ? "bg-(--success-green)" : "bg-orange-400"} text-white`}
        >
          {quiz.published ? <Check size={15} /> : <FileWarning size={15} />}
        </div>

        <span className="mt-1 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider status-badge-active">
          {quiz.published ? "Опубликован" : "Черновик"}
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
          {quiz.questions_count} {t("quizCard.questions")}
        </div>
        <div className="flex items-center gap-1.5">
          <Check className="text-purple-500" size={15} /> {quiz.attempt_limit}{" "}
          Попыток
        </div>
      </div>

      <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-[10px] uppercase font-bold text-slate-400">
            {t("quizCard.deadline")}
          </p>
          <p className="text-sm font-bold flex items-center gap-1 text-slate-700">
            <Calendar size={14} />
            {quiz.dueDate ? formatQuizDate(quiz.dueDate) : "Нет дедлайна"}
          </p>
        </div>

        <NavLink
          to={"/teacher/edit-quiz/" + quiz.id}
          className="w-full sm:w-auto text-center px-5 py-2.5 bg-(--main-blue) text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-all"
        >
          {quiz.published ? t("buttons.preview") : "Редактировать тест"}
        </NavLink>
      </div>
    </div>
  );
};
