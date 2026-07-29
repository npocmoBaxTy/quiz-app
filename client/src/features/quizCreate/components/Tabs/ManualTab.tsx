import { useFieldArray, useFormContext } from "react-hook-form";
import { QuestionItem } from "../Question";
import { QuestionAdd } from "../QuestionAdd/QuestionAdd";
import { QuestionSummary } from "../QuestionsList/QuestionsList";
import { useState } from "react";

export const ManualTab = () => {
  const { control } = useFormContext();
  const { fields, remove, append, replace } = useFieldArray({
    control,
    name: "questions",
  });

  const [activeIndex, setActiveIndex] = useState<number | null>(
    fields.length > 0 ? 0 : null,
  );

  // Функция добавления вопроса с умным переходом
  const handleAddQuestion = () => {
    const newQuestion = {
      text: "",
      points: 2,
      type: "single",
      description: "",
      answers: [
        { text: "", isCorrect: true },
        { text: "", isCorrect: false },
        { text: "", isCorrect: false },
        { text: "", isCorrect: false },
      ],
    };

    // 🔥 ОБХОДИМ БАГ RHF:
    if (fields.length === 0) {
      // Если список пуст, жестко заменяем массив (никакого воскрешения!)
      replace([newQuestion]);
      setActiveIndex(0); // Открываем первый вопрос
    } else {
      // Если в списке уже есть вопросы, просто добавляем в конец
      append(newQuestion);
      setActiveIndex(fields.length); // Открываем добавленный
    }
  };

  const handleRemove = (index: number) => {
    remove(index);
    // Умное переключение активного индекса при удалении
    if (activeIndex === index) {
      setActiveIndex(Math.max(0, index - 1));
    } else if (activeIndex !== null && activeIndex > index) {
      setActiveIndex(activeIndex - 1);
    }

    // Если удалили последний вопрос
    if (fields.length <= 1) setActiveIndex(null);
  };

  return (
    <div className="manual__tab relative w-full p-4 flex flex-col min-h-125">
      <div className="fixed w-[19%] bg-white flex flex-col gap-2 left-0 top-0 z-100 h-screen overflow-y-scroll p-2">
        <div className="list__button ml-auto flex gap-1">
          <button
            type="button"
            className="text-xs px-1.5 py-1 rounded-md bg-red-100 text-red-600 cursor-pointer hover:bg-red-200 transition-colors"
            onClick={() => {
              // Логика удаления всех вопросов
              replace([]);
              setActiveIndex(null);
            }}
          >
            Удалить все
          </button>
          <button
            type="button"
            className="text-xs px-1.5 py-1 rounded-md bg-blue-100 text-blue-600 cursor-pointer hover:bg-blue-200 transition-colors"
            onClick={handleAddQuestion}
          >
            Добавить вопрос
          </button>
        </div>
        {fields.map((field, index) => (
          <QuestionSummary
            key={field.id}
            index={index}
            isActive={activeIndex === index}
            onClick={() => setActiveIndex(index)}
            onRemove={() => handleRemove(index)}
          />
        ))}
      </div>
      {/* Редактор вопроса */}
      <div className="flex-1">
        {activeIndex !== null && fields[activeIndex] ? (
          <QuestionItem qIndex={activeIndex} />
        ) : (
          <div className="flex items-center justify-center h-full min-h-75 border-2 border-dashed rounded-lg text-zinc-400">
            Выберите вопрос для редактирования или создайте новый
          </div>
        )}
      </div>

      <QuestionAdd onClick={handleAddQuestion} />
    </div>
  );
};
