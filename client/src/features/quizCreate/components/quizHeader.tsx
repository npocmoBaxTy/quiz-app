import { useFormContext, type Path } from "react-hook-form";
import { useState } from "react";
import toast from "react-hot-toast";

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
}: {
  breadcrumbs?: boolean;
  isEditMode: boolean;
  quizId?: string;
}) => {
  const form = useFormContext<QuizFormValues>();

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
      toast.error("Заполните название теста");
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
      toast.error("Исправьте ошибки перед сохранением");
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
          Предпросмотр
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
              <Spinner /> Сохранение...
            </>
          ) : (
            "Сохранить черновик"
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
              <Spinner /> В процессе...
            </>
          ) : (
            "Опубликовать"
          )}
        </Button>
      </div>
    </div>
  );
};
