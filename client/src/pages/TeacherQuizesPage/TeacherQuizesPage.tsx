import { useMemo, useState } from "react";
import { NavLink } from "react-router-dom";
import {
  AlertCircle,
  ClipboardList,
  FileEdit,
  Plus,
  Search,
  Sparkles,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { Loader } from "@/widgets/Loader/Loader";
import { TeacherSidebar } from "@/app/components/ui/teacherSidebar";
import { useQuizzes } from "./hooks/useGetQuizes";
import { PublishedCard } from "./components/PublishedCard";
import type { Quiz } from "./types";

type FilterKey = "all" | "published" | "draft";

export const TeacherQuizesPage = () => {
  const { t } = useTranslation();
  const FILTERS: { key: FilterKey; label: string }[] = [
    { key: "all", label: t("teacherQuizzes.filters.all") },
    { key: "published", label: t("teacherQuizzes.filters.published") },
    { key: "draft", label: t("teacherQuizzes.filters.draft") },
  ];
  const { data, isLoading, isError } = useQuizzes();
  const [filter, setFilter] = useState<FilterKey>("all");
  const [search, setSearch] = useState("");

  const publishedCount = data?.filter((q) => q.published).length ?? 0;
  const draftCount = data?.filter((q) => !q.published).length ?? 0;

  const filtered = useMemo(() => {
    if (!data) return [];
    return data
      .filter((quiz) =>
        filter === "all" ? true : filter === "published" ? quiz.published : !quiz.published,
      )
      .filter((quiz) => quiz.title.toLowerCase().includes(search.toLowerCase()));
  }, [data, filter, search]);

  if (isLoading)
    return (
      <>
        <TeacherSidebar />
        <div className="lg:ml-64">
          <Loader />
        </div>
      </>
    );

  return (
    <>
      <TeacherSidebar />

      {/* pl вместо ml, чтобы контент остался отцентрованным в своей колонке */}
      <div className="lg:pl-64">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 p-5 sm:p-8">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-(--text-main)">{t("teacherQuizzes.title")}</h1>
          <p className="mt-1 text-sm text-(--text-muted)">
            {t("teacherQuizzes.subtitle")}
          </p>
        </div>
        <NavLink
          to="/teacher/create-quiz"
          className="flex items-center gap-2 rounded-xl bg-(--main-blue) px-5 py-2.5 text-sm font-bold text-white shadow-sm shadow-(--main-blue)/20 transition-all active:scale-95 hover:brightness-105"
        >
          <Plus size={18} />
          {t("teacherQuizzes.createQuiz")}
        </NavLink>
      </div>

      {isError && (
        <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-(--danger-red)/20 bg-(--danger-dim) py-16 text-(--danger-red)">
          <AlertCircle size={32} />
          <p className="font-bold">{t("teacherQuizzes.loadError")}</p>
          <p className="text-sm opacity-80">{t("teacherQuizzes.loadErrorHint")}</p>
        </div>
      )}

      {data && (
        <>
          <div className="grid grid-cols-3 gap-3 sm:gap-4">
            <StatTile
              icon={<ClipboardList size={18} />}
              label={t("teacherQuizzes.stats.all")}
              value={data.length}
              accent="blue"
            />
            <StatTile
              icon={<Sparkles size={18} />}
              label={t("teacherQuizzes.stats.published")}
              value={publishedCount}
              accent="green"
            />
            <StatTile
              icon={<FileEdit size={18} />}
              label={t("teacherQuizzes.stats.drafts")}
              value={draftCount}
              accent="amber"
            />
          </div>

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
                placeholder={t("teacherQuizzes.searchPlaceholder")}
                className="w-full rounded-xl border border-(--surface-high) bg-(--surface-main) py-2.5 pr-4 pl-10 text-sm outline-none transition-all focus:border-(--main-blue) focus:ring-2 focus:ring-(--main-blue)/15"
              />
            </div>
            <div className="flex shrink-0 gap-1 rounded-xl border border-(--surface-high) bg-(--surface-main) p-1">
              {FILTERS.map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setFilter(key)}
                  className={`rounded-lg px-3.5 py-1.5 text-xs font-bold transition-all ${
                    filter === key
                      ? "bg-(--main-blue) text-white"
                      : "text-(--text-muted) hover:bg-(--hover-bg) hover:text-(--text-main)"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {filtered.length === 0 ? (
            <EmptyState hasQuizzes={data.length > 0} t={t} />
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((quiz: Quiz) => (
                <PublishedCard key={quiz.id} quiz={quiz} />
              ))}
            </div>
          )}
        </>
      )}
        </div>
      </div>
    </>
  );
};

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
  value: number;
  accent: "blue" | "green" | "amber";
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-(--surface-high) bg-(--surface-main) p-4">
      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${accentClasses[accent]}`}>
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
  hasQuizzes,
  t,
}: {
  hasQuizzes: boolean;
  t: (key: string) => string;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-(--surface-high) bg-(--surface-main) py-16">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-(--hover-bg)">
        <ClipboardList size={26} className="text-(--main-blue)" />
      </div>
      <p className="font-bold text-(--text-main)">
        {hasQuizzes ? t("teacherQuizzes.empty.notFound") : t("teacherQuizzes.empty.noQuizzes")}
      </p>
      <p className="max-w-sm text-center text-sm text-(--text-muted)">
        {hasQuizzes
          ? t("teacherQuizzes.empty.notFoundHint")
          : t("teacherQuizzes.empty.noQuizzesHint")}
      </p>
    </div>
  );
}
