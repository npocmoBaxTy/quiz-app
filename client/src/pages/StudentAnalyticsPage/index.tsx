import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { TrendingUp, TrendingDown, Target, Award, CheckCircle2 } from "lucide-react";
import { Sidebar } from "@/app/components/ui/sidebar";
import { Header } from "@/widgets/header/header";
import { Loader } from "@/widgets/Loader/Loader";
import { useStudentAnalytics } from "./api";
import { ProgressChart } from "./ProgressChart";
import { QuestionTypeBreakdown } from "./QuestionTypeBreakdown";

export const StudentAnalyticsPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { data, isLoading, isError } = useStudentAnalytics();

  const summary = data?.summary;

  // Насколько последние 30 дней отличаются от среднего за все время
  const trend =
    summary?.recentAveragePercent != null && summary?.averagePercent != null
      ? summary.recentAveragePercent - summary.averagePercent
      : null;

  const hasData = (data?.timeline.length ?? 0) > 0;

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex font-sans text-slate-800">
      <Sidebar />

      <main className="flex-1 flex flex-col min-h-screen overflow-x-hidden lg:ml-64">
        <Header />

        <div className="p-6 lg:p-8 max-w-7xl mx-auto w-full flex-1 flex flex-col gap-8">
          <div>
            <h1 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-2">
              {t("analytics.title", "Аналитика")}
            </h1>
            <p className="text-slate-500">
              {t("analytics.subtitle", "Как меняются ваши результаты и где вы теряете баллы")}
            </p>
          </div>

          {isLoading && (
            <div className="flex justify-center py-20">
              <Loader />
            </div>
          )}

          {isError && (
            <div className="bg-white rounded-[20px] p-8 border border-slate-200 text-center text-slate-500">
              {t("analytics.loadError", "Не удалось загрузить аналитику")}
            </div>
          )}

          {!isLoading && !isError && !hasData && (
            <div className="bg-white rounded-[24px] p-12 border border-slate-200 shadow-sm text-center">
              <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-5">
                <TrendingUp size={32} />
              </div>
              <h2 className="text-xl font-bold text-slate-900 mb-2">
                {t("analytics.emptyTitle", "Пока нечего показывать")}
              </h2>
              <p className="text-slate-500 mb-6">
                {t("analytics.emptyText", "Пройдите первый тест — здесь появится динамика и разбор ошибок")}
              </p>
              <button
                onClick={() => navigate("/student/quizes")}
                className="bg-slate-900 hover:bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold transition-all active:scale-95"
              >
                {t("analytics.emptyAction", "К тестам")}
              </button>
            </div>
          )}

          {!isLoading && !isError && hasData && data && summary && (
            <>
              {/* МЕТРИКИ */}
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
                <MetricCard
                  icon={<Target size={20} />}
                  tone="indigo"
                  label={t("analytics.avgScore", "Средний результат")}
                  value={summary.averagePercent != null ? `${summary.averagePercent}%` : "—"}
                  hint={
                    trend != null && trend !== 0
                      ? t("analytics.trendHint", "за последние 30 дней")
                      : undefined
                  }
                  trend={trend}
                />
                <MetricCard
                  icon={<Award size={20} />}
                  tone="amber"
                  label={t("analytics.bestScore", "Лучший результат")}
                  value={summary.bestPercent != null ? `${summary.bestPercent}%` : "—"}
                />
                <MetricCard
                  icon={<CheckCircle2 size={20} />}
                  tone="emerald"
                  label={t("analytics.passed", "Зачтено тестов")}
                  value={`${summary.passedCount} / ${summary.totalAttempts}`}
                />
                <MetricCard
                  icon={<TrendingUp size={20} />}
                  tone="slate"
                  label={t("analytics.attempts", "Всего попыток")}
                  value={String(summary.totalAttempts)}
                />
              </div>

              {/* ДИНАМИКА */}
              <section className="bg-white rounded-[24px] p-6 lg:p-8 border border-slate-200 shadow-sm">
                <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                      <span className="w-2 h-6 bg-indigo-600 rounded-full inline-block" />
                      {t("analytics.dynamicsTitle", "Динамика результатов")}
                    </h2>
                    <p className="text-sm text-slate-500 mt-1 pl-4">
                      {t("analytics.dynamicsSubtitle", "Процент за каждую завершенную попытку")}
                    </p>
                  </div>
                  <button
                    onClick={() => navigate("/student/quizes")}
                    className="text-sm font-bold text-slate-400 hover:text-indigo-600 transition-colors"
                  >
                    {t("analytics.openTable", "Смотреть списком")}
                  </button>
                </div>

                <ProgressChart points={data.timeline} />
              </section>

              {/* РАЗБОР ПО ТИПАМ ВОПРОСОВ */}
              {data.byQuestionType.length > 0 && (
                <section className="bg-white rounded-[24px] p-6 lg:p-8 border border-slate-200 shadow-sm">
                  <div className="mb-8">
                    <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                      <span className="w-2 h-6 bg-emerald-500 rounded-full inline-block" />
                      {t("analytics.byTypeTitle", "Где теряются баллы")}
                    </h2>
                    <p className="text-sm text-slate-500 mt-1 pl-4">
                      {t("analytics.byTypeSubtitle", "Доля полностью верных ответов по типу вопроса")}
                    </p>
                  </div>

                  <QuestionTypeBreakdown stats={data.byQuestionType} />
                </section>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
};

const TONES: Record<string, string> = {
  indigo: "bg-indigo-50 text-indigo-600",
  amber: "bg-amber-50 text-amber-600",
  emerald: "bg-emerald-50 text-emerald-600",
  slate: "bg-slate-100 text-slate-600",
};

function MetricCard({
  icon,
  tone,
  label,
  value,
  hint,
  trend,
}: {
  icon: React.ReactNode;
  tone: keyof typeof TONES;
  label: string;
  value: string;
  hint?: string;
  trend?: number | null;
}) {
  return (
    <div className="bg-white rounded-[20px] p-5 border border-slate-200 shadow-sm">
      <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-4 ${TONES[tone]}`}>
        {icon}
      </div>
      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
        {label}
      </p>
      <div className="flex items-baseline gap-2">
        <p className="text-3xl font-black text-slate-900 leading-none">{value}</p>
        {trend != null && trend !== 0 && (
          <span
            className={`flex items-center gap-0.5 text-sm font-bold ${
              trend > 0 ? "text-emerald-600" : "text-rose-600"
            }`}
          >
            {trend > 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
            {trend > 0 ? "+" : ""}
            {trend}
          </span>
        )}
      </div>
      {hint && <p className="text-xs text-slate-400 mt-1.5">{hint}</p>}
    </div>
  );
}
