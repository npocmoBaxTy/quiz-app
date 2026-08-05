import { NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  CheckCircle2,
  FileText,
  Users,
  MoreVertical,
  Edit3,
  BarChart,
  Trash2,
} from "lucide-react";
import type { Quiz } from "../../types";
import { formatQuizDate } from "@/pages/TeacherQuizesPage/hooks/formateDate";

// Замените any на ваш интерфейс Quiz, если он у вас описан
export function QuizCard({ quiz }: { quiz: Quiz }) {
  const { t } = useTranslation();
  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden hover:shadow-md hover:border-blue-300 transition-all group flex flex-col">
      <div className="p-5 flex-1">
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center gap-2">
            {quiz.published ? (
              <span className="inline-flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md font-medium text-xs">
                <CheckCircle2 size={12} /> {t("teacherDashboard.quizCard.published")}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-slate-500 bg-slate-100 px-2 py-1 rounded-md font-medium text-xs">
                <FileText size={12} /> {t("teacherDashboard.quizCard.draft")}
              </span>
            )}
          </div>
          <button className="text-slate-400 hover:text-slate-800 p-1 rounded-md hover:bg-slate-50 transition-colors">
            <MoreVertical size={18} />
          </button>
        </div>

        <h3 className="font-bold text-slate-800 text-lg mb-2 line-clamp-2">
          {quiz.title}
        </h3>

        <p className="text-sm text-slate-500 flex items-center gap-2 mb-4">
          <span>{t("teacherDashboard.quizCard.created")}: {formatQuizDate(quiz.created_at)}</span>
          <span>•</span>
          <span>{quiz.questions_count} {t("teacherDashboard.quizCard.questionsShort")}</span>
        </p>

        <div className="grid grid-cols-2 gap-2 mt-auto">
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
            <p className="text-xs text-slate-400 font-medium mb-1 flex items-center gap-1">
              <Users size={12} /> {t("teacherDashboard.quizCard.attempts")}
            </p>
            <p className="font-bold text-slate-700">{quiz.attemptsCount}</p>
          </div>
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
            <p className="text-xs text-slate-400 font-medium mb-1 flex items-center gap-1">
              <BarChart size={12} /> {t("teacherDashboard.quizCard.avgScore")}
            </p>
            <p className="font-bold text-slate-700">
              {quiz.avgScore ? quiz.avgScore : "—"}
            </p>
          </div>
        </div>
      </div>

      <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/50 flex gap-2">
        {/* 🔥 НОВАЯ КНОПКА: Результаты */}
        {/* Если у теста 0 попыток, можно делать кнопку неактивной, но пока оставим всегда кликабельной */}
        <NavLink
          to={`/teacher/quizzes/${quiz.id}/attempts`}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-blue-50 border border-blue-200 hover:bg-blue-100 hover:border-blue-300 text-blue-700 text-sm font-medium rounded-lg transition-colors"
          title={t("teacherDashboard.quizCard.viewResultsTitle")}
        >
          <BarChart size={16} /> {t("teacherDashboard.quizCard.results")}
        </NavLink>

        {/* Кнопка редактирования (Сделал текст чуть короче "Изменить", чтобы влезло на узких экранах) */}
        <NavLink
          to={`/teacher/edit-quiz/${quiz.id}`}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 text-sm font-medium rounded-lg transition-colors"
          title={t("teacherDashboard.quizCard.editTitle")}
        >
          <Edit3 size={16} /> {t("teacherDashboard.quizCard.edit")}
        </NavLink>

        {/* Удаление */}
        <button
          className="p-2 text-slate-400 hover:text-red-600 shrink-0 bg-white border border-slate-200 hover:border-red-200 hover:bg-red-50 rounded-lg transition-colors"
          title={t("teacherDashboard.quizCard.deleteTitle")}
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
}
