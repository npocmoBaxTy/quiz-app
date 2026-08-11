import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useFormContext, useWatch } from "react-hook-form";

import type { QuizFormValues } from "../types";
import { AutoQuestionsLimitContext } from "./autoQuestionsLimitContext";

/**
 * questionsLimit — это размер «билета»: сколько вопросов из пула получит
 * студент (см. startAttempt). Обычно он равен всему пулу, поэтому по
 * умолчанию поле считается автоматически, а ручной ввод остаётся для
 * случая «пул большой, студенту — выборка».
 *
 * Провайдер оборачивает весь билдер, а не живёт внутри QuizConfiger:
 * вкладка настроек размонтирована, пока преподаватель добавляет вопросы,
 * и пересчёт бы просто не произошёл.
 */
export const AutoQuestionsLimitProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const { control, setValue, getValues } = useFormContext<QuizFormValues>();

  const questions = useWatch({ control, name: "questions" });
  const count = questions?.length ?? 0;

  // Провайдер монтируется уже после загрузки теста, поэтому режим можно
  // определить сразу по сохранённым значениям: лимит меньше пула означает,
  // что преподаватель выставил его руками — перетирать нельзя.
  const [isAuto, setIsAuto] = useState(
    () => getValues("questionsLimit") === (getValues("questions")?.length ?? 0),
  );

  useEffect(() => {
    if (!isAuto) return;

    const next = count || 1; // 0 сломал бы min(1) в схеме
    if (getValues("questionsLimit") !== next) {
      setValue("questionsLimit", next, {
        shouldDirty: true,
        shouldValidate: true,
      });
    }
  }, [isAuto, count, setValue, getValues]);

  const value = useMemo(
    () => ({ isAuto, setIsAuto, questionsCount: count }),
    [isAuto, count],
  );

  return (
    <AutoQuestionsLimitContext.Provider value={value}>
      {children}
    </AutoQuestionsLimitContext.Provider>
  );
};
