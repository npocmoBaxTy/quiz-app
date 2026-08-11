import { memo } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import { Trash2, AlertCircle } from "lucide-react"; // Добавили красивые иконки
import { useTranslation } from "react-i18next";
import { isQuestionReady } from "../../utils/isQuestionReady";

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

    const isReady = isQuestionReady({ questionText, questionType, answers });

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
