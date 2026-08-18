import { useState } from "react";
import {
  Clock,
  ScrollText,
  Calendar,
  CheckCircle2,
  FileEdit,
  Users,
  Target,
  BarChart3,
  Trash2,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { NavLink } from "react-router-dom";
import { DeleteQuizDialog } from "@/features/quizDelete";
import { formatQuizDate } from "../hooks/formateDate";
import type { Quiz } from "../types";

export const PublishedCard = ({ quiz }: { quiz: Quiz }) => {
  const { t } = useTranslation();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const isPublished = quiz.published;

  return (
    <div className="group flex w-full flex-col rounded-2xl border border-(--surface-high) bg-(--surface-main) p-5 transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/5">
      <div className="mb-3 flex items-center justify-between">
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold tracking-wide uppercase ${
            isPublished
              ? "bg-(--success-green)/10 text-(--success-green)"
              : "bg-(--amber-dim) text-amber-700"
          }`}
        >
          {isPublished ? (
            <CheckCircle2 size={13} />
          ) : (
            <FileEdit size={13} />
          )}
          {isPublished ? t("teacherQuizzes.card.published") : t("teacherQuizzes.card.draft")}
        </span>
        <span className="text-xs font-medium text-(--text-muted)">
          {formatQuizDate(quiz.created_at)}
        </span>
      </div>

      <h3 className="mb-1 line-clamp-2 text-lg font-bold text-(--text-main)">
        {quiz.title}
      </h3>
      <p className="mb-4 text-sm text-(--text-muted)">{quiz.creator_name}</p>

      <div className="mb-4 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs font-medium text-(--text-muted)">
        <div className="flex items-center gap-1.5">
          <Clock className="text-(--main-blue)" size={14} />
          {quiz.time_limit} {t("quizCard.time")}
        </div>
        <div className="flex items-center gap-1.5">
          <ScrollText className="text-purple-500" size={14} />
          {quiz.questions_count} {t("quizCard.questions")}
        </div>
        <div className="flex items-center gap-1.5">
          <Target className="text-(--success-green)" size={14} />
          {t("teacherQuizzes.card.passing")} {quiz.passing}%
        </div>
      </div>

      <div className="mb-4 grid grid-cols-2 gap-2">
        <div className="rounded-xl border border-(--surface-high) bg-(--main-bg) px-3 py-2.5">
          <p className="mb-0.5 flex items-center gap-1 text-[10px] font-bold tracking-wide text-(--text-muted) uppercase">
            <Users size={11} /> {t("teacherQuizzes.card.attempts")}
          </p>
          <p className="font-mono text-sm font-bold text-(--text-main) tabular-nums">
            {quiz.attemptsCount}
          </p>
        </div>
        <div className="rounded-xl border border-(--surface-high) bg-(--main-bg) px-3 py-2.5">
          <p className="mb-0.5 flex items-center gap-1 text-[10px] font-bold tracking-wide text-(--text-muted) uppercase">
            <BarChart3 size={11} /> {t("teacherQuizzes.card.avgScore")}
          </p>
          <p className="font-mono text-sm font-bold text-(--text-main) tabular-nums">
            {quiz.avgScore ? `${quiz.avgScore}%` : "—"}
          </p>
        </div>
      </div>

      <div className="mt-auto flex items-center gap-2 border-t border-(--surface-high) pt-4">
        <NavLink
          to={`/teacher/quizzes/${quiz.id}/attempts`}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-(--surface-high) py-2.5 text-sm font-bold text-(--text-main) transition-colors hover:bg-(--hover-bg)"
        >
          <BarChart3 size={15} /> {t("teacherQuizzes.card.results")}
        </NavLink>
        <NavLink
          to={"/teacher/edit-quiz/" + quiz.id}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-(--main-blue) py-2.5 text-sm font-bold text-white transition-all hover:brightness-105"
        >
          {isPublished ? (
            <Calendar size={15} />
          ) : (
            <FileEdit size={15} />
          )}
          {isPublished ? t("buttons.preview") : t("teacherQuizzes.card.edit")}
        </NavLink>
        <button
          type="button"
          onClick={() => setConfirmDelete(true)}
          title={t("teacherQuizzes.delete.title")}
          aria-label={t("teacherQuizzes.delete.title")}
          className="shrink-0 rounded-xl border border-(--surface-high) p-2.5 text-(--text-muted) transition-colors hover:border-(--danger-red)/30 hover:bg-(--danger-dim) hover:text-(--danger-red)"
        >
          <Trash2 size={15} />
        </button>
      </div>

      {confirmDelete && (
        <DeleteQuizDialog
          quizId={quiz.id}
          title={quiz.title}
          attemptsCount={quiz.attemptsCount}
          onClose={() => setConfirmDelete(false)}
        />
      )}
    </div>
  );
};
