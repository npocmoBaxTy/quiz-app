// hooks/useFocusTracking.ts
import { useEffect, useRef } from "react";
import { useTestStore } from "@/pages/QuizTaking/store/store";
import toast from "react-hot-toast";

export const useFocusTracking = () => {
  // Подписываемся только на функцию (она стабильна и не вызывает ререндеров)
  const incrementViolation = useTestStore((s) => s.incrementViolation);
  
  // Храним время последнего нарушения, чтобы избежать двойных срабатываний
  const lastViolationTime = useRef<number>(0);

  useEffect(() => {
    const handleViolation = () => {
      const now = Date.now();
      
      // 🔥 Защита от двойного срабатывания: игнорируем события в течение 1 секунды
      if (now - lastViolationTime.current < 1000) return;
      lastViolationTime.current = now;

      // 🔥 Читаем актуальное состояние стора БЕЗ подписки (без ререндеров компонента!)
      const { violations, maxViolations } = useTestStore.getState();

      if (violations < maxViolations - 1) {
        toast.error("Внимание! Потеря фокуса или переключение вкладки.", { 
          icon: '⚠️', 
          duration: 3000 
        });
      } else if (violations === maxViolations - 1) {
        toast.error("Последнее предупреждение! Тест будет завершен.", { 
          icon: '🚨', 
          duration: 4000 
        });
      }
      
      incrementViolation();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        handleViolation();
      }
    };

    // Вешаем слушатели
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleViolation);

    // Удаляем слушатели при размонтировании
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleViolation);
    };
  }, [incrementViolation]); // 🔥 Массив зависимостей теперь чист, слушатели вешаются только 1 раз!
};