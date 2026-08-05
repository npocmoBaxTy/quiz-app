import type { Answer } from "@/features/quizCreate/types";
import { useFormContext, useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { QuizDropdown } from "../../QuizDropdown";
import { memo } from "react"; // ДОБАВЛЕНО!

type Props = {
  qIndex: number;
};

export const QuestionHeader = memo(({ qIndex }: Props) => {
  const { control, setValue } = useFormContext();
  const { t } = useTranslation();

  const typeMap: Record<string, "single" | "multiple" | "text"> = {
    [t("quizBuilder.questionTypes.single")]: "single",
    [t("quizBuilder.questionTypes.multiple")]: "multiple",
    [t("quizBuilder.questionTypes.text")]: "text",
  };

  const reverseMap = {
    single: t("quizBuilder.questionTypes.single"),
    multiple: t("quizBuilder.questionTypes.multiple"),
    text: t("quizBuilder.questionTypes.text"),
  };

  const questionType = useWatch({
    control,
    name: `questions.${qIndex}.type`,
  });
  const questionText = useWatch({
    control,
    name: `questions.${qIndex}.text`,
  });
  const questionPoints = useWatch({
    control,
    name: `questions.${qIndex}.points`,
  });

  // Для валидации готовности нам нужны только isCorrect флаги и длина массива
  const answers =
    useWatch({ control, name: `questions.${qIndex}.answers` }) || [];

  const isQuestionReady = () => {
    // 1. Текст вопроса обязателен
    if (!questionText?.trim()) return false;

    // 2. Если тип текстовый (эссе) — больше ничего не нужно
    if (questionType === "text") return true;

    // 3. Проверки для тестовых вопросов
    const hasMinAnswers = answers.length >= 2;

    // 🔥 НОВОЕ: Проверяем, что текст есть абсолютно в каждом варианте ответа
    const allAnswersHaveText = answers.every((a: Answer) => !!a.text?.trim());

    // Считаем количество правильных ответов
    const correctCount = answers.filter((a: Answer) => a.isCorrect).length;

    if (questionType === "single") {
      // Вопрос готов только если: есть 2+ ответа И во всех есть текст И выбран ровно 1 правильный
      return hasMinAnswers && allAnswersHaveText && correctCount === 1;
    }

    if (questionType === "multiple") {
      // То же самое, но правильных ответов может быть 1 или больше
      return hasMinAnswers && allAnswersHaveText && correctCount >= 1;
    }

    return false;
  };

  const isReady = isQuestionReady();

  return (
    <div className="p-2 border-b flex items-center gap-4 w-full">
      <div
        className={`w-5 h-5 text-white rounded-md text-xs flex items-center justify-center ${isReady ? "bg-green-500" : "bg-red-500"
          }`}
      >
        {qIndex + 1}
      </div>

      <div>
        <div className="text-muted-foreground text-sm">
          {/* Обрезаем длинный текст в шапке для красоты */}
          {questionText
            ? questionText.length > 50
              ? questionText.slice(0, 50) + "..."
              : questionText
            : t("quizBuilder.enterQuestionText")}
        </div>

        <div className="flex items-center gap-1.5 mt-1">
          <div
            className={`text-white text-xs px-1.5 rounded-xl ${isReady ? "bg-green-500" : "bg-red-500"
              }`}
          >
            {isReady ? t("quizBuilder.ready") : t("quizBuilder.notReady")}
          </div>

          <div className="text-white bg-blue-500 px-1.5 text-xs rounded-xl">
            {answers.length} {t("quizBuilder.answersCountShort")}
          </div>

          <div className="text-white bg-orange-400 text-xs px-1.5 rounded-xl">
            {questionPoints || 1} {t("quizBuilder.pointsShort")}
          </div>
        </div>
      </div>

      <div className="ml-auto flex items-start">
        <div className="question__type mr-5">
          <QuizDropdown
            items={[
              t("quizBuilder.questionTypes.multiple"),
              t("quizBuilder.questionTypes.single"),
            ]}
            label={t("quizBuilder.selectTypeLabel")}
            value={
              questionType &&
              reverseMap[questionType as keyof typeof reverseMap]
            }
            onSelect={(label) => {
              const value = typeMap[label];
              setValue(`questions.${qIndex}.type`, value);

              // ❗ если текстовый → очищаем ответы
              if (value === "text") {
                setValue(`questions.${qIndex}.answers`, []);
              } else if (answers.length === 0) {
                // Опционально: если переключили обратно на тест, создаем 2 пустых варианта
                setValue(`questions.${qIndex}.answers`, [
                  { text: "", isCorrect: false },
                  { text: "", isCorrect: false },
                ]);
              }
            }}
          />
        </div>
      </div>
    </div>
  );
});

QuestionHeader.displayName = "QuestionHeader";
