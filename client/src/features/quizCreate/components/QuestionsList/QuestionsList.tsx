import { memo } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import { Trash2, AlertCircle } from "lucide-react"; // Добавили красивые иконки
import { useTranslation } from "react-i18next";
import type { Answer } from "../../types";

type Props = {
  index: number;
  isActive: boolean;
  onClick: () => void;
  onRemove: () => void;
};

export const QuestionSummary = memo(
  ({ index, isActive, onClick, onRemove }: Props) => {
    const { control } = useFormContext();
    const { t } = useTranslation();

    // Следим за нужными полями конкретно ЭТОГО вопроса
    const questionText = useWatch({ control, name: `questions.${index}.text` });
    const questionType = useWatch({ control, name: `questions.${index}.type` });
    // Массив ответов нужен, чтобы проверить, выбран ли правильный
    const answers =
      useWatch({ control, name: `questions.${index}.answers` }) || [];

    // Функция проверки готовности (та самая логика, что была в старой шапке)
    const checkIsReady = () => {
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

    const isReady = checkIsReady();

    return (
      <div
        onClick={onClick}
        className={`p-3 rounded-lg border cursor-pointer transition-all flex items-center justify-between group ${
          isActive
            ? "border-blue-500 bg-blue-50 shadow-sm"
            : "border-zinc-200 hover:border-blue-300 hover:bg-zinc-50"
        }`}
      >
        <div className="flex items-center gap-3 overflow-hidden pr-1">
          {/* Кружок с номером вопроса меняет цвет в зависимости от готовности */}
          <span
            className={`shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
              isReady
                ? "bg-green-100 text-green-600" // Готов - зеленый
                : "bg-red-100 text-red-500" // Не готов - красный
            }`}
          >
            {index + 1}
          </span>

          <span
            className={`truncate text-xs ${isReady ? "text-green-600" : "text-zinc-500"} font-medium`}
          >
            {questionText || t("quizBuilder.enterQuestionText")}
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* Иконка статуса */}
          {!isReady && <AlertCircle size={16} className="text-red-400" />}

          {/* Кнопка удаления */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation(); // Чтобы клик на удаление не сделал вопрос активным
              onRemove();
            }}
            className="text-zinc-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-1"
            title={t("quizBuilder.deleteQuestion")}
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    );
  },
);

QuestionSummary.displayName = "QuestionSummary";
