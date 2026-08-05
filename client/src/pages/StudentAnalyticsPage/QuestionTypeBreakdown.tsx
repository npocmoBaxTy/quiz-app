import { useTranslation } from "react-i18next";
import type { QuestionTypeStat } from "./types";

const TYPE_LABEL_FALLBACK: Record<QuestionTypeStat["type"], string> = {
  single: "Один вариант",
  multiple: "Несколько вариантов",
};

export function QuestionTypeBreakdown({ stats }: { stats: QuestionTypeStat[] }) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-6">
      {stats.map((stat) => {
        const percentage = stat.percentage ?? 0;
        // Слабое место подсвечиваем, чтобы его было видно без чтения цифр
        const isWeak = percentage < 60;

        return (
          <div key={stat.type}>
            <div className="mb-2 flex items-end justify-between gap-4">
              <span className="text-sm font-bold text-slate-700">
                {t(
                  `analytics.questionType.${stat.type}`,
                  TYPE_LABEL_FALLBACK[stat.type],
                )}
              </span>
              <span className="shrink-0 text-sm font-black text-slate-900">
                {percentage}%
                <span className="ml-2 text-xs font-semibold text-slate-400">
                  {stat.correct}/{stat.total}
                </span>
              </span>
            </div>

            <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
              <div
                className={`h-full rounded-full transition-all ${
                  isWeak ? "bg-amber-500" : "bg-indigo-600"
                }`}
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
