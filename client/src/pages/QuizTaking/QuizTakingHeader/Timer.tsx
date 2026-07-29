import { useEffect, useRef, useState } from "react";
import { useTestStore } from "../store/store";
import toast from "react-hot-toast";


export function Timer() {
  const timeLimitInMinutes = useTestStore((s) => s.quiz.time_limit);
  const submitTest = useTestStore((s) => s.submitTest);
  const isSubmitting = useTestStore((s) => s.isSubmitting);

  const hasSubmitted = useRef(false);
  // Переводим минуты в секунды для удобства расчетов
  const [secondsLeft, setSecondsLeft] = useState(timeLimitInMinutes * 60);

  const handleAutoSubmit = async () => {
    try {
      toast.error("Время истекло! Результаты отправляются...", {
        duration: 4000,
        icon: "⏰",
      });
      await submitTest();
    } catch (e) {
      console.log(e)
      toast.error(
        "Не удалось отправить тест автоматически. Попробуйте нажать кнопку вручную.",
      );
    }
  };

  useEffect(() => {
    // Если время вышло и мы еще не отправляли тест
    if (secondsLeft <= 0 && !hasSubmitted.current) {
      hasSubmitted.current = true;
      handleAutoSubmit();
      return;
    }

    if (secondsLeft <= 0) return;

    const timerId = setInterval(() => {
      setSecondsLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timerId);
  }, [secondsLeft]);

  // Форматирование секунд в ММ:СС
  const formatTime = (totalSeconds: number) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  };

  
  const timerColor = secondsLeft < 60 ? "text-red-500" : "text-blue-600";

  return (
    <div className="text-right">
      <div
        id="timer"
        className={`text-2xl font-mono font-bold transition-colors ${timerColor}`}
      >
        {formatTime(secondsLeft)}
      </div>
      <p className="text-[10px] uppercase text-slate-400 font-bold tracking-wider">
        {secondsLeft > 0 ? "Осталось времени" : "Время истекло"}
      </p>
      {/* Визуальный индикатор отправки, если время вышло */}
      {isSubmitting && (
        <span className="text-[10px] text-indigo-500 animate-pulse font-bold">
          Сохранение...
        </span>
      )}
    </div>
  );
}
