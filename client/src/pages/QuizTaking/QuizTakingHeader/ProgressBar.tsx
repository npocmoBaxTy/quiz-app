import { useTestStore } from "../store/store";

export function QuizProgressBar({ questions }: { questions: number }) {
  const answeredCount = useTestStore((s) => s.getAnsweredCount());
  return (
    <div className="mb-8">
      <div className="flex justify-between text-sm mb-2">
        <span id="question-counter" className="font-medium">
          Вы ответили на {answeredCount} из {questions}
        </span>
        <span id="progress-percentage" className="text-slate-500">
          {Math.min((answeredCount / questions) * 100, 100).toFixed(1)}%
        </span>
      </div>
      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
        <div
          id="progress-bar"
          className="bg-blue-600 h-full transition-all duration-1000"
          style={{
            width: `${Math.min((answeredCount / questions) * 100, 100).toFixed(1)}%`,
          }}
        ></div>
      </div>
    </div>
  );
}
