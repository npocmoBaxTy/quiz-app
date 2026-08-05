import { Clock } from "lucide-react";
import { useTranslation } from "react-i18next";

/**
 * Метка просроченной сдачи. Сама просрочка считается на сервере
 * (started_at + time_limit), клиент только показывает результат.
 */
export function LateBadge({
  overtimeSeconds,
  compact = false,
}: {
  overtimeSeconds: number;
  compact?: boolean;
}) {
  const { t } = useTranslation();
  const minutes = Math.max(1, Math.round(overtimeSeconds / 60));

  return (
    <span
      title={t("attemptTiming.lateBy", { count: minutes })}
      className="inline-flex shrink-0 items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[11px] font-bold tracking-wide text-amber-700 uppercase"
    >
      <Clock size={11} />
      {compact ? t("attemptTiming.late") : t("attemptTiming.lateBy", { count: minutes })}
    </span>
  );
}
