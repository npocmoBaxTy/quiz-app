import { useState } from "react";
import { Spinner } from "@/shared/ui/SPinner/Spinner";
import { Dialog } from "@/shared/ui/Dialog/Dialog";
import { useTestStore } from "../store/store";

// 🔥 1. Описываем пропсы, которые придут от родителя
interface QuestionFooterProps {
  onConfirmSubmit: () => void; // Функция отправки
  isSubmitting: boolean;       // Статус загрузки
}

export function QuestionFooter({ onConfirmSubmit, isSubmitting }: QuestionFooterProps) {
  const [isDialogVisible, setDialogVisible] = useState(false);

  // Оставляем только то, что нужно для UI (навигация и статистика)
  const next = useTestStore((s) => s.next);
  const prev = useTestStore((s) => s.prev);
  const questions = useTestStore((s) => s.questions);
  const answers = useTestStore((s) => s.answers);

  // Считаем статистику для показа в окне
  const totalQuestions = questions.length;
  const answeredCount = Object.keys(answers || {}).length;
  const unansweredCount = totalQuestions - answeredCount;

  return (
    <div className="question__footer--wrapper mt-auto flex items-center p-4 w-full">
      <Dialog onClose={() => setDialogVisible(false)} visible={isDialogVisible}>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Готовы завершить тест?
        </h2>

        <p className="text-gray-600 mb-6">
          Вы больше не сможете вернуться к вопросам и изменить свои ответы.
        </p>

        {/* Блок со сводкой */}
        <div className="bg-gray-50 rounded-xl p-4 mb-6 border border-gray-100">
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-600 font-medium">Всего вопросов:</span>
            <span className="font-bold text-gray-900">{totalQuestions}</span>
          </div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-600 font-medium">Дано ответов:</span>
            <span className="font-bold text-green-600">{answeredCount}</span>
          </div>

          {unansweredCount > 0 && (
            <div className="flex justify-between items-center pt-2 border-t border-gray-200 mt-2">
              <span className="text-red-500 font-bold">Пропущено:</span>
              <span className="font-bold text-red-500">{unansweredCount}</span>
            </div>
          )}
        </div>

        {unansweredCount > 0 && (
          <div className="mb-6 p-3 bg-red-50 text-red-700 text-sm rounded-lg flex items-start gap-2">
            {/* ... ваш svg иконки ... */}
            <p>
              У вас остались вопросы без ответов! Если вы завершите тест сейчас,
              за них будет начислено 0 баллов.
            </p>
          </div>
        )}

        {/* Кнопки действий */}
        <div className="flex gap-3">
          <button
            onClick={() => setDialogVisible(false)}
            disabled={isSubmitting} // 🔥 Используем проп isSubmitting
            className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold rounded-xl transition-colors disabled:opacity-50"
          >
            Отмена, вернусь
          </button>

          <button
            onClick={onConfirmSubmit} // 🔥 Вызываем функцию от родителя!
            disabled={isSubmitting}   // 🔥 Используем проп
            className="flex-1 px-4 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl transition-colors disabled:opacity-50 flex justify-center items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Spinner /> 
                Отправка...
              </>
            ) : (
              "Да, завершить"
            )}
          </button>
        </div>
      </Dialog>

      <div className="submit__button flex gap-2">
        <button
          onClick={() => setDialogVisible(true)}
          className="cursor-pointer duration-300 hover:shadow-2xl text-white px-3 py-2 rounded-md text-sm"
          style={{
            background:
              answeredCount === totalQuestions
                ? "var(--success-green)"
                : "var(--danger-red)",
          }}
        >
          Завершить Тест
        </button>
      </div>

      <div className="skip__button flex items-center ml-auto gap-2">
        <button
          onClick={prev}
          className="bg-muted-foreground cursor-pointer duration-300 hover:shadow-2xl text-white px-3 py-2 rounded-md text-sm"
        >
          Предыдущий
        </button>
        <button
          onClick={next}
          className="bg-(--main-blue) cursor-pointer duration-300 hover:shadow-2xl text-white px-3 py-2 rounded-md text-sm"
        >
          Следующий
        </button>
      </div>
    </div>
  );
}