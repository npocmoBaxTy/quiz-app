import { useFormContext, type Path } from "react-hook-form";
import { useState } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";

import { Button } from "@/app/components/ui/button";
import { QuizBreadCrumbs } from "./BreadCrumbs";
import { QuizBadges } from "./QuizBadges";
import { Spinner } from "@/shared/ui/SPinner/Spinner";
import { QuizPreview } from "@/features/quizPreview/quizPreview";

import type { QuizFormValues } from "../types";
import { transformQuiz, transformQuizToBackend } from "../utils/transformQuiz";
import { quizDraftSchema, quizPublishSchema } from "../lib/schema";

// 🔥 Импортируем наши новые хуки
import { useCreateQuiz, useUpdateQuiz } from "./../api/creatQuiz";

export const QuizHeader = ({
  breadcrumbs = true,
  isEditMode,
  quizId,
  onNeedsTab,
}: {
  breadcrumbs?: boolean;
  isEditMode: boolean;
  quizId?: string;
  onNeedsTab?: (tab: string) => void;
}) => {
  const form = useFormContext<QuizFormValues>();
  const { t } = useTranslation();

  // 2. ПОДКЛЮЧАЕМ МУТАЦИИ
  const createMutation = useCreateQuiz();
  const updateMutation = useUpdateQuiz();

  // Общий статус загрузки для блокировки кнопок
  const isAnyPending = createMutation.isPending || updateMutation.isPending;

  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  // --- СОХРАНЕНИЕ ЧЕРНОВИКА ---
  const submitDraft = async (e?: React.MouseEvent) => {
    if (isAnyPending) return;
    if (e) e.preventDefault();

    const allValues = form.getValues();
    const result = quizDraftSchema.safeParse(allValues);

    if (!result.success) {
      console.error("Ошибки сохранения черновика:", result.error.format());
      toast.error(t("quizBuilder.fillTitleError"));
      return;
    }

    const finalData = { ...allValues, ...result.data };
    const payload = transformQuiz(finalData, false); // published: false

    // 🔥 РАЗВЕТВЛЕНИЕ: Создаем или Обновляем?
    if (isEditMode && quizId) {
      updateMutation.mutate({ quizId, payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  // --- ПУБЛИКАЦИЯ ---
  const submitPublish = async (e?: React.MouseEvent) => {
    if (isAnyPending) return;
    if (e) e.preventDefault();

    await form.trigger(); // Подсвечиваем ошибки в UI

    const allValues = form.getValues();
    const result = quizPublishSchema.safeParse(allValues);

    if (!result.success) {
      result.error.issues.forEach((err) => {
        const fieldPath = err.path.join(".") as Path<QuizFormValues>;
        form.setError(fieldPath, {
          type: "manual",
          message: err.message,
        });
      });

      // Ошибка может относиться к полю на неактивной вкладке (она не
      // отрендерена в DOM), поэтому переключаемся на нужную вкладку,
      // чтобы пользователь увидел, что именно нужно исправить.
      const firstIssue = result.error.issues[0];
      const targetTab =
        firstIssue.path[0] === "questions" ? "questions" : "settings";
      onNeedsTab?.(targetTab);

      toast.error(firstIssue.message || t("quizBuilder.fixErrorsError"));
      return;
    }

    // Собираем валидные данные
    const finalData = { ...allValues, ...result.data };

    const payload = transformQuizToBackend(finalData, true);

    // Разветвление: Создаем или Обновляем?
    if (isEditMode && quizId) {
      updateMutation.mutate({ quizId, payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  return (
    <div className="quiz__builder--header relative flex items-center gap-2 p-3 bg-white rounded-xl mt-2 w-full">
      <QuizPreview
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
      />

      <div className="mr-auto">{breadcrumbs && <QuizBreadCrumbs />}</div>

      <div className="quiz__header--badges ml-10">
        <QuizBadges />
      </div>

      <div className="quiz__header--buttons flex items-center gap-2">
        <Button
          type="button"
          onClick={() => setIsPreviewOpen(true)}
          className="text-xs px-3 py-px bg-transparent cursor-pointer border rounded-md border-black text-black hover:text-white"
        >
          {t("quizBuilder.preview")}
        </Button>

        {/* КНОПКА ЧЕРНОВИКА */}
        <Button
          type="button"
          onClick={submitDraft}
          disabled={isAnyPending}
          className={`text-xs px-3 py-px bg-transparent border rounded-md border-(--main-blue) hover:bg-(--main-blue) text-black hover:text-white ${isAnyPending ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          {isAnyPending ? (
            <>
              <Spinner /> {t("quizBuilder.saving")}
            </>
          ) : (
            t("quizBuilder.saveDraft")
          )}
        </Button>

        {/* КНОПКА ПУБЛИКАЦИИ */}
        <Button
          type="button"
          onClick={submitPublish}
          disabled={isAnyPending}
          className={`text-xs px-3 py-px bg-transparent border rounded-md border-(--success-green) hover:bg-(--success-green) text-black hover:text-white ${isAnyPending ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          {isAnyPending ? (
            <>
              <Spinner /> {t("quizBuilder.publishing")}
            </>
          ) : (
            t("quizBuilder.publish")
          )}
        </Button>
      </div>
    </div>
  );
};
