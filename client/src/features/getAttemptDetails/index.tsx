import { useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ChevronRight,
  Search,
  Trophy,
  User,
  Users,
  BarChart3,
  AlertCircle,
  ArrowUpDown,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { Loader } from "@/widgets/Loader/Loader";
import { useGetQuizAttempts } from "./hooks/useAttemptDetails";
import type { QuizAttemptListItem } from "./types/types";
import { LateBadge } from "@/shared/ui/LateBadge/LateBadge";

type SortKey = "date" | "score" | "name";

const scoreTone = (score: number) => {
  if (score >= 70)
    return {
      badge: "bg-(--success-green)/10 text-(--success-green) border-(--success-green)/20",
      ring: "border-(--success-green)/20 bg-(--success-green)/10 text-(--success-green)",
    };
  if (score >= 40)
    return {
      badge: "bg-(--amber-dim) text-amber-700 border-amber-200",
      ring: "border-amber-200 bg-(--amber-dim) text-amber-700",
    };
  return {
    badge: "bg-(--danger-dim) text-(--danger-red) border-(--danger-red)/20",
    ring: "border-(--danger-red)/20 bg-(--danger-dim) text-(--danger-red)",
  };
};

export const QuizAttemptsPage = () => {
  const { t } = useTranslation();
  const { quizId } = useParams<{ quizId: string }>();
  const navigate = useNavigate();

  const { data: attempts, isLoading, isError } = useGetQuizAttempts(quizId);

  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("date");

  const avgScore = useMemo(() => {
    if (!attempts || attempts.length === 0) return null;
    return Math.round(
      attempts.reduce((sum, a) => sum + a.score, 0) / attempts.length,
    );
  }, [attempts]);

  const passedCount = useMemo(
    () => attempts?.filter((a) => a.score >= 70).length ?? 0,
    [attempts],
  );

  const filtered = useMemo(() => {
    if (!attempts) return [];
    const list = attempts.filter((a) =>
      a.studentName.toLowerCase().includes(search.toLowerCase()),
    );
    const sorted = [...list].sort((a, b) => {
      if (sortKey === "score") return b.score - a.score;
      if (sortKey === "name") return a.studentName.localeCompare(b.studentName);
      return (
        new Date(b.finishedAt ?? 0).getTime() -
        new Date(a.finishedAt ?? 0).getTime()
      );
    });
    return sorted;
  }, [attempts, search, sortKey]);

  if (isLoading) return <Loader />;

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 p-5 sm:p-8">
      <button
        onClick={() => navigate("/teacher/quizes")}
        className="flex w-fit items-center gap-2 text-sm font-medium text-(--text-muted) transition-colors hover:text-(--text-main)"
      >
        <ArrowLeft size={16} /> {t("quizAttempts.back")}
      </button>

      <div>
        <h1 className="text-2xl font-bold text-(--text-main)">
          {t("quizAttempts.title")}
        </h1>
        <p className="mt-1 text-sm text-(--text-muted)">
          {t("quizAttempts.subtitle")}
        </p>
      </div>

      {isError && (
        <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-(--danger-red)/20 bg-(--danger-dim) py-16 text-(--danger-red)">
          <AlertCircle size={32} />
          <p className="font-bold">{t("quizAttempts.loadError")}</p>
          <p className="text-sm opacity-80">{t("quizAttempts.loadErrorHint")}</p>
        </div>
      )}

      {attempts && (
        <>
          <div className="grid grid-cols-3 gap-3 sm:gap-4">
            <StatTile
              icon={<Users size={18} />}
              label={t("quizAttempts.stats.total")}
              value={attempts.length}
              accent="blue"
            />
            <StatTile
              icon={<BarChart3 size={18} />}
              label={t("quizAttempts.stats.avgScore")}
              value={avgScore !== null ? `${avgScore}%` : "—"}
              accent="amber"
            />
            <StatTile
              icon={<Trophy size={18} />}
              label={t("quizAttempts.stats.passed")}
              value={passedCount}
              accent="green"
            />
          </div>

          {attempts.length > 0 && (
            <div className="flex flex-col gap-3 md:flex-row md:items-center">
              <div className="relative flex-1">
                <Search
                  className="absolute top-1/2 left-3 -translate-y-1/2 text-(--text-muted)"
                  size={17}
                />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={t("quizAttempts.searchPlaceholder")}
                  className="w-full rounded-xl border border-(--surface-high) bg-(--surface-main) py-2.5 pr-4 pl-10 text-sm outline-none transition-all focus:border-(--main-blue) focus:ring-2 focus:ring-(--main-blue)/15"
                />
              </div>
              <div className="flex shrink-0 gap-1 rounded-xl border border-(--surface-high) bg-(--surface-main) p-1">
                {(
                  [
                    { key: "date", label: t("quizAttempts.sort.date") },
                    { key: "score", label: t("quizAttempts.sort.score") },
                    { key: "name", label: t("quizAttempts.sort.name") },
                  ] as { key: SortKey; label: string }[]
                ).map(({ key, label }) => (
                  <button
                    key={key}
                    onClick={() => setSortKey(key)}
                    className={`flex items-center gap-1 rounded-lg px-3.5 py-1.5 text-xs font-bold transition-all ${
                      sortKey === key
                        ? "bg-(--main-blue) text-white"
                        : "text-(--text-muted) hover:bg-(--hover-bg) hover:text-(--text-main)"
                    }`}
                  >
                    {key === sortKey && <ArrowUpDown size={11} />}
                    {label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {filtered.length === 0 ? (
            <EmptyState hasAttempts={attempts.length > 0} t={t} />
          ) : (
            <div className="flex flex-col gap-2.5">
              {filtered.map((attempt) => (
                <AttemptRow
                  key={attempt.id}
                  attempt={attempt}
                  t={t}
                  onClick={() =>
                    navigate(`/teacher/student-attempt/${attempt.id}`)
                  }
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

function AttemptRow({
  attempt,
  onClick,
  t,
}: {
  attempt: QuizAttemptListItem;
  onClick: () => void;
  t: (key: string) => string;
}) {
  const tone = scoreTone(attempt.score);

  return (
    <div
      onClick={onClick}
      className="group flex cursor-pointer items-center gap-4 rounded-2xl border border-(--surface-high) bg-(--surface-main) p-4 transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/5"
    >
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-(--hover-bg) text-(--main-blue)">
        <User size={20} />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate font-bold text-(--text-main)">
            {attempt.studentName}
          </p>
          {attempt.isLate && (
            <LateBadge overtimeSeconds={attempt.overtimeSeconds} compact />
          )}
        </div>
        <p className="text-xs font-medium text-(--text-muted)">
          {attempt.finishedAt
            ? new Date(attempt.finishedAt).toLocaleDateString("ru-RU", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })
            : t("quizAttempts.noDateSpecified")}
        </p>
      </div>

      <div
        className={`flex h-11 min-w-11 shrink-0 items-center justify-center rounded-xl border-2 px-2 font-mono text-sm font-black tabular-nums ${tone.ring}`}
      >
        {attempt.score}%
      </div>

      <span
        className={`hidden shrink-0 rounded-full border px-2.5 py-1 text-[11px] font-bold tracking-wide uppercase sm:inline-flex ${tone.badge}`}
      >
        {attempt.score >= 70 ? t("quizAttempts.passed") : t("quizAttempts.failed")}
      </span>

      <ChevronRight
        size={18}
        className="shrink-0 text-(--text-muted) opacity-0 transition-opacity group-hover:opacity-100"
      />
    </div>
  );
}

const accentClasses: Record<string, string> = {
  blue: "bg-(--main-blue)/10 text-(--main-blue)",
  green: "bg-(--success-green)/10 text-(--success-green)",
  amber: "bg-(--amber-dim) text-amber-700",
};

function StatTile({
  icon,
  label,
  value,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  accent: "blue" | "green" | "amber";
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-(--surface-high) bg-(--surface-main) p-4">
      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${accentClasses[accent]}`}
      >
        {icon}
      </div>
      <div>
        <p className="font-mono text-xl leading-none font-bold text-(--text-main) tabular-nums">
          {value}
        </p>
        <p className="mt-1 text-xs font-medium text-(--text-muted)">{label}</p>
      </div>
    </div>
  );
}

function EmptyState({
  hasAttempts,
  t,
}: {
  hasAttempts: boolean;
  t: (key: string) => string;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-(--surface-high) bg-(--surface-main) py-16">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-(--hover-bg)">
        <Trophy size={26} className="text-(--main-blue)" />
      </div>
      <p className="font-bold text-(--text-main)">
        {hasAttempts ? t("quizAttempts.empty.notFound") : t("quizAttempts.empty.noAttempts")}
      </p>
      <p className="max-w-sm text-center text-sm text-(--text-muted)">
        {hasAttempts
          ? t("quizAttempts.empty.notFoundHint")
          : t("quizAttempts.empty.noAttemptsHint")}
      </p>
    </div>
  );
}
