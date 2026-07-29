import { CheckCircle2, XCircle, CalendarDays, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import type { ResultsListProps } from "../types";

export const ResultsList = ({ data }: ResultsListProps) => {
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
          Здесь будут ваши результаты
        </h3>
        <p className="text-slate-500 text-sm">
          Вы еще не завершили ни одного теста.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
      {data.map((result) => {
        // Высчитываем процент для проверки статуса
        const percentage =
          result.maxScore > 0
            ? Math.round((result.score / result.maxScore) * 100)
            : 0;
        const isPassed = percentage >= result.passingScore;

        // Форматируем дату
        const formattedDate = new Date(result.completedAt).toLocaleDateString(
          "ru-RU",
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
            className="bg-white border border-slate-200 rounded-2xl p-6 hover:shadow-md transition-shadow flex flex-col h-full relative overflow-hidden"
          >
            {/* Декоративная полоска слева, показывающая статус (Сдан / Не сдан) */}
            <div
              className={`absolute left-0 top-0 bottom-0 w-1.5 ${isPassed ? "bg-green-500" : "bg-red-500"}`}
            />

            <div className="flex justify-between items-start mb-4">
              <div>
                {/* Статус (бейдж) */}
                <div
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold mb-3 ${
                    isPassed
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {isPassed ? (
                    <CheckCircle2 size={14} />
                  ) : (
                    <XCircle size={14} />
                  )}
                  {isPassed ? "ТЕСТ СДАН" : "ТЕСТ НЕ СДАН"}
                </div>
                <h3
                  className="text-xl font-bold text-slate-900 line-clamp-2"
                  title={result.quizTitle}
                >
                  {result.quizTitle}
                </h3>
                <p className="text-sm text-slate-500 mt-1">
                  {result.teacherName}
                </p>
              </div>
            </div>

            {/* Блок с баллами */}
            <div className="bg-slate-50 rounded-xl p-4 flex items-center justify-between mt-auto mb-5 border border-slate-100">
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">
                  Ваш результат
                </p>
                <div className="text-3xl font-black text-slate-900">
                  {result.score}{" "}
                  <span className="text-lg text-slate-400 font-medium">
                    / {result.maxScore}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <div
                  className={`text-2xl font-bold ${isPassed ? "text-green-600" : "text-red-500"}`}
                >
                  {percentage}%
                </div>
                <p className="text-xs text-slate-500">
                  Проходной: {result.passingScore}%
                </p>
              </div>
            </div>

            {/* Футер карточки (Дата и кнопка) */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <CalendarDays size={16} />
                <span>{formattedDate}</span>
              </div>

              <Link
                to={`/student/results/${result.attemptId}`}
                className="flex items-center gap-1 text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors"
              >
                Посмотреть ответы
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        );
      })}
    </div>
  );
};
