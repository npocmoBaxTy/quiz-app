import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import type { TimelinePoint } from "./types";

// Система координат SVG. Ширина фиксирована, растягивается через viewBox.
const VB_W = 800;
const VB_H = 280;
const PAD = { top: 16, right: 20, bottom: 34, left: 40 };

const PLOT_W = VB_W - PAD.left - PAD.right;
const PLOT_H = VB_H - PAD.top - PAD.bottom;

const Y_TICKS = [0, 25, 50, 75, 100];
const MAX_X_LABELS = 6;

const DATE_LOCALES: Record<string, string> = {
  ru: "ru-RU",
  en: "en-US",
  uz: "uz-UZ",
};

export function ProgressChart({ points }: { points: TimelinePoint[] }) {
  const { t, i18n } = useTranslation();
  const [hovered, setHovered] = useState<number | null>(null);

  const locale = DATE_LOCALES[i18n.language] ?? "ru-RU";

  const formatDate = (value: string | null) =>
    value
      ? new Date(value).toLocaleDateString(locale, {
          day: "numeric",
          month: "short",
        })
      : "—";

  const xOf = (index: number) =>
    points.length === 1
      ? PAD.left + PLOT_W / 2
      : PAD.left + (index / (points.length - 1)) * PLOT_W;

  const yOf = (percentage: number) =>
    PAD.top + PLOT_H - (percentage / 100) * PLOT_H;

  const linePath = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${xOf(i)} ${yOf(p.percentage)}`)
    .join(" ");

  // Пунктир порога рисуем только если он одинаков для всех попыток —
  // иначе одна линия врала бы про часть точек.
  const sharedPassing = useMemo(() => {
    const values = points.map((p) => p.passing);
    const first = values[0];
    return first !== null && values.every((v) => v === first) ? first : null;
  }, [points]);

  // Прореживаем подписи оси X, чтобы они не наезжали друг на друга
  const labelStep = Math.max(1, Math.ceil(points.length / MAX_X_LABELS));

  const active = hovered !== null ? points[hovered] : null;

  return (
    <div className="relative">
      <svg
        viewBox={`0 0 ${VB_W} ${VB_H}`}
        className="w-full h-auto overflow-visible"
        role="img"
        aria-label={t("analytics.chartAria", "График результатов по датам")}
        onMouseLeave={() => setHovered(null)}
      >
        {/* Сетка и подписи оси Y */}
        {Y_TICKS.map((tick) => (
          <g key={tick}>
            <line
              x1={PAD.left}
              x2={PAD.left + PLOT_W}
              y1={yOf(tick)}
              y2={yOf(tick)}
              stroke="#e2e8f0"
              strokeWidth={1}
            />
            <text
              x={PAD.left - 10}
              y={yOf(tick)}
              textAnchor="end"
              dominantBaseline="middle"
              className="fill-slate-400 text-[11px] font-medium"
            >
              {tick}
            </text>
          </g>
        ))}

        {/* Порог сдачи */}
        {sharedPassing !== null && (
          <g>
            <line
              x1={PAD.left}
              x2={PAD.left + PLOT_W}
              y1={yOf(sharedPassing)}
              y2={yOf(sharedPassing)}
              stroke="#f43f5e"
              strokeWidth={1.5}
              strokeDasharray="6 5"
            />
            <text
              x={PAD.left + PLOT_W}
              y={yOf(sharedPassing) - 7}
              textAnchor="end"
              className="fill-rose-500 text-[11px] font-semibold"
            >
              {t("analytics.passingLine", "Порог")} {sharedPassing}%
            </text>
          </g>
        )}

        {/* Линия динамики */}
        <path
          d={linePath}
          fill="none"
          stroke="#ff8600"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Точки: цвет = сдано / не сдано */}
        {points.map((p, i) => {
          const isPass = p.passing !== null && p.percentage >= p.passing;
          return (
            <circle
              key={p.attemptId}
              cx={xOf(i)}
              cy={yOf(p.percentage)}
              r={hovered === i ? 6 : 4}
              fill={isPass ? "#059669" : "#e11d48"}
              stroke="#ffffff"
              strokeWidth={2}
            />
          );
        })}

        {/* Подписи оси X */}
        {points.map((p, i) =>
          i % labelStep === 0 || i === points.length - 1 ? (
            <text
              key={p.attemptId}
              x={xOf(i)}
              y={VB_H - 12}
              textAnchor="middle"
              className="fill-slate-400 text-[11px] font-medium"
            >
              {formatDate(p.completedAt)}
            </text>
          ) : null,
        )}

        {/* Прицел активной точки */}
        {hovered !== null && (
          <line
            x1={xOf(hovered)}
            x2={xOf(hovered)}
            y1={PAD.top}
            y2={PAD.top + PLOT_H}
            stroke="#94a3b8"
            strokeWidth={1}
            strokeDasharray="4 4"
          />
        )}

        {/* Зоны наведения — шире самих точек, чтобы попадать мышью */}
        {points.map((p, i) => {
          const bandW = points.length === 1 ? PLOT_W : PLOT_W / (points.length - 1);
          return (
            <rect
              key={`hit-${p.attemptId}`}
              x={xOf(i) - bandW / 2}
              y={PAD.top}
              width={bandW}
              height={PLOT_H}
              fill="transparent"
              onMouseEnter={() => setHovered(i)}
            />
          );
        })}
      </svg>

      {/* Тултип */}
      {active && (
        <div
          className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full rounded-xl bg-slate-900 px-3 py-2 text-white shadow-lg"
          style={{
            // Прижимаем к краям, чтобы тултип крайней точки не уезжал за карточку
            left: `${Math.min(88, Math.max(12, (xOf(hovered!) / VB_W) * 100))}%`,
            top: `${(yOf(active.percentage) / VB_H) * 100 - 4}%`,
          }}
        >
          <p className="text-[11px] font-bold text-slate-400">
            {formatDate(active.completedAt)}
          </p>
          <p className="max-w-[220px] truncate text-sm font-bold">
            {active.quizTitle ?? "—"}
          </p>
          <p className="text-sm font-black">{active.percentage}%</p>
        </div>
      )}

      {/* Легенда статусов */}
      <div className="mt-4 flex flex-wrap items-center gap-5 pl-10 text-xs font-semibold text-slate-500">
        <span className="flex items-center gap-2">
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-emerald-600" />
          {t("analytics.legendPassed", "Зачтено")}
        </span>
        <span className="flex items-center gap-2">
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-rose-600" />
          {t("analytics.legendFailed", "Не зачтено")}
        </span>
      </div>
    </div>
  );
}
