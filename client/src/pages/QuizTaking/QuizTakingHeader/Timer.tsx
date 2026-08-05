import { useEffect, useRef, useState } from "react";
import { Clock } from "lucide-react";
import { useTestStore } from "../store/store";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";


export function Timer() {
  const { t } = useTranslation();
  const timeLimitInMinutes = useTestStore((s) => s.quiz.time_limit);
  const lockTest = useTestStore((s) => s.lockTest);
  const isSubmitting = useTestStore((s) => s.isSubmitting);

  const hasExpired = useRef(false);
  // Переводим минуты в секунды для удобства расчетов
  const [secondsLeft, setSecondsLeft] = useState(timeLimitInMinutes * 60);

  useEffect(() => {
    // Время вышло — блокируем тест. Отправку выполнит useEffect по isLocked
    // в QuizTaking, второй точки сабмита здесь быть не должно.
    if (secondsLeft <= 0 && !hasExpired.current) {
      hasExpired.current = true;
      toast.error(t("quizTaking.timer.timeExpiredToast"), {
        duration: 4000,
        icon: "⏰",
      });
      lockTest("time_expired");
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

  const isLow = secondsLeft < 60;

  return (
    <div
      className={`shrink-0 flex flex-col items-center gap-0.5 px-4 py-2 rounded-2xl border ${
        isLow
          ? "bg-rose-50 border-rose-100"
          : "bg-indigo-50 border-indigo-100"
      }`}
    >
      <div
        id="timer"
        className={`flex items-center gap-1.5 text-lg font-mono font-black tabular-nums transition-colors ${
          isLow ? "text-rose-600" : "text-indigo-600"
        }`}
      >
        <Clock size={16} className={isLow ? "animate-pulse" : ""} />
        {formatTime(secondsLeft)}
      </div>
      <p
        className={`text-[9px] uppercase font-bold tracking-wider ${isLow ? "text-rose-400" : "text-indigo-400"}`}
      >
        {secondsLeft > 0 ? t("quizTaking.timer.timeLeft") : t("quizTaking.timer.timeExpired")}
      </p>
      {/* Визуальный индикатор отправки, если время вышло */}
      {isSubmitting && (
        <span className="text-[9px] text-indigo-500 animate-pulse font-bold">
          {t("quizTaking.timer.saving")}
        </span>
      )}
    </div>
  );
}
