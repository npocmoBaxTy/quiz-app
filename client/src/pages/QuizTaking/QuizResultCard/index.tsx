import { useNavigate } from "react-router-dom";
import { useTestStore } from "../store/store";
import { AlertCircle } from "lucide-react";

interface QuizResultCardProps {
  score: number;
  maxScore: number;
  passingPercentage?: number; // Делаем необязательным, по умолчанию будет 60
}

export function QuizResultCard({
  score,
  maxScore,
  passingPercentage = 60,
}: QuizResultCardProps) {
  const navigate = useNavigate();

  // Логика подсчета вынесена внутрь самого компонента
  const percentage = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
  const isSuccess = percentage >= passingPercentage;
  const violations = useTestStore((s) => s.violations);
  const maxViolations = useTestStore((s) => s.maxViolations);

  const isForceSubmitted = violations >= maxViolations;

  return (
    <div className="quiz__result--wrapper mx-auto flex items-center justify-center w-full min-h-[70vh] p-5">
      <div className="bg-white p-8 md:p-10 rounded-2xl border border-gray-100 flex flex-col items-center max-w-md w-full animate-in fade-in zoom-in duration-500">
        {/* Иконка */}
        {isForceSubmitted && (
        <div className="w-full mb-6 p-4 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3">
          <AlertCircle className="text-red-500 shrink-0" size={18} />
          <p className="text-xs text-red-700 font-medium">
            Тест был завершен автоматически из-за превышения лимита нарушений ({violations}/{maxViolations}).
          </p>
        </div>
      )}
        <div
          className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 ${isSuccess ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"}`}
        >
          <svg
            className="w-10 h-10"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            {isSuccess ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            )}
          </svg>
        </div>

        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          {isSuccess ? "Поздравляем!" : "Тест завершен"}
        </h2>
        <p className="text-gray-500 text-center mb-8">
          Ваши ответы успешно сохранены и отправлены преподавателю.
        </p>

        {/* Блок с баллами */}
        <div className="bg-gray-50 rounded-xl p-6 w-full text-center mb-8 border border-gray-100">
          <div className="text-sm text-gray-500 font-medium mb-1">
            Ваш результат
          </div>
          <div className="text-5xl font-black text-indigo-600 mb-2">
            {score}{" "}
            <span className="text-2xl text-gray-400">/ {maxScore || "?"}</span>
          </div>
          <div className="text-sm font-medium text-gray-500">
            {percentage}% правильных ответов
          </div>
        </div>

        {/* Кнопка возврата к списку */}
        <button
          onClick={() => navigate("/student/quizes", { replace: true })}
          className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all hover:shadow-lg"
        >
          Вернуться к списку тестов
        </button>
      </div>
    </div>
  );
}
