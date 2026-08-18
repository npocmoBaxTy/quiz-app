import { useTranslation } from "react-i18next";
import { AlertTriangle } from "lucide-react";

import { Dialog, DialogContent, DialogTitle } from "@/app/components/ui/dialog";

import { useDeleteQuiz } from "../api/deleteQuiz";

type Props = {
  quizId: string;
  title: string;
  /** Сколько попыток студентов удалится вместе с тестом */
  attemptsCount?: number;
  onClose: () => void;
};

export function DeleteQuizDialog({ quizId, title, attemptsCount = 0, onClose }: Props) {
  const { t } = useTranslation();
  const deleteQuiz = useDeleteQuiz();

  const handleDelete = () => {
    deleteQuiz.mutate(quizId, { onSuccess: onClose });
  };

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="z-100 rounded-3xl sm:max-w-md">
        <DialogTitle className="flex items-center gap-2 text-lg font-bold text-slate-900">
          <AlertTriangle className="text-red-600" size={20} />
          {t("teacherQuizzes.delete.title")}
        </DialogTitle>

        <p className="text-sm text-slate-600">
          {t("teacherQuizzes.delete.confirm", { title })}
        </p>

        {attemptsCount > 0 && (
          <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {t("teacherQuizzes.delete.attemptsWarning", { count: attemptsCount })}
          </p>
        )}

        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={deleteQuiz.isPending}
            className="px-5 py-2.5 rounded-xl font-medium text-slate-500 transition-colors hover:bg-slate-100 disabled:opacity-50"
          >
            {t("teacherQuizzes.delete.cancel")}
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleteQuiz.isPending}
            className="px-5 py-2.5 rounded-xl bg-red-600 font-medium text-white shadow-sm transition-all hover:bg-red-700 active:scale-95 disabled:opacity-50 disabled:active:scale-100"
          >
            {deleteQuiz.isPending
              ? t("teacherQuizzes.delete.deleting")
              : t("teacherQuizzes.delete.submit")}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
