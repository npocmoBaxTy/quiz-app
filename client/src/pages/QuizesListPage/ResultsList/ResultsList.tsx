import { CheckCircle2, XCircle, CalendarDays, ArrowRight, User, Award } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import type { ResultsListProps } from "../types";

const DATE_LOCALES: Record<string, string> = {
  ru: "ru-RU",
  en: "en-US",
  uz: "uz-UZ",
};

export const ResultsList = ({ data }: ResultsListProps) => {
  const { t, i18n } = useTranslation();
  // Состояние, если данных еще нет или загрузка
  if (!data) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Состояние, если массив пустой (студент еще ничего не прошел)
  if (data.length === 0) {
    return (
      <div className="text-center py-20 bg-white border border-slate-200 rounded-2xl">
        <CheckCircle2 size={48} className="mx-auto text-slate-300 mb-4" />
        <h3 className="text-lg font-bold text-slate-700 mb-1">
          {t("resultsList.emptyTitle")}
        </h3>
        <p className="text-slate-500 text-sm">
          {t("resultsList.emptySubtitle")}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      {data.map((result) => {
        // Высчитываем процент для проверки статуса
        const percentage =
          result.maxScore > 0
            ? Math.round((result.score / result.maxScore) * 100)
            : 0;
        const isPassed = percentage >= result.passingScore;

        // Форматируем дату
        const formattedDate = new Date(result.completedAt).toLocaleDateString(
          DATE_LOCALES[i18n.language] ?? "ru-RU",
          {
            day: "numeric",
            month: "long",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          },
        );

        return (
          <div
            key={result.id}
            className="flex flex-col bg-white border border-slate-200 rounded-2xl p-5 hover:shadow-xl hover:border-indigo-200 transition-all duration-300 group relative overflow-hidden"
          >
            {/* Верхняя полоска-индикатор статуса */}
            <div
              className={`absolute top-0 left-0 w-full h-1 ${isPassed ? "bg-emerald-500" : "bg-rose-500"}`}
            />

            {/* Шапка карточки */}
            <div className="flex justify-between items-start mb-4 gap-4">
              <h3
                className="text-lg font-bold text-slate-800 leading-snug line-clamp-2 group-hover:text-indigo-600 transition-colors"
                title={result.quizTitle}
              >
                {result.quizTitle}
              </h3>
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold whitespace-nowrap border shrink-0 ${isPassed
                    ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                    : "bg-rose-50 text-rose-600 border-rose-100"
                  }`}
              >
                {isPassed ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
                {isPassed ? t("resultDetails.passed") : t("resultDetails.failed")}
              </span>
            </div>

            {/* Автор */}
            <div className="flex items-center gap-2 text-sm text-slate-500 font-medium mb-5">
              <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                <User size={12} />
              </div>
              <span className="truncate">{result.teacherName}</span>
            </div>

            {/* Характеристики */}
            <div className="grid grid-cols-2 gap-2 text-xs font-semibold text-slate-600 mb-6">
              <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-lg border border-slate-100">
                <Award size={14} className="text-slate-400" />
                <span>{result.score} / {result.maxScore}</span>
              </div>
              <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-lg border border-slate-100">
                <CalendarDays size={14} className="text-slate-400" />
                <span className="truncate">{formattedDate}</span>
              </div>
            </div>

            {/* Подвал с результатом и кнопкой */}
            <div className="mt-auto flex items-center justify-between pt-4 border-t border-slate-100">
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">
                  {t("resultsList.yourResult")}
                </span>
                <span className={`font-bold ${isPassed ? "text-emerald-600" : "text-rose-500"}`}>
                  {percentage}%{" "}
                  <span className="text-slate-400 font-normal">
                    {t("resultsList.passingLabel", { score: result.passingScore })}
                  </span>
                </span>
              </div>

              <Link
                to={`/student/results/${result.attemptId}`}
                className="flex items-center gap-2 bg-slate-900 hover:bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-semibold transition-all shadow-sm active:scale-95"
              >
                {t("resultsList.viewAnswers")}
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        );
      })}
    </div>
  );
};
