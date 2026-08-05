// hooks/useFaceDetection.ts
import { useEffect, useState, type RefObject } from "react";
import * as faceapi from "face-api.js";
import { useTranslation } from "react-i18next";
import { useTestStore } from "@/pages/QuizTaking/store/store";
import toast from "react-hot-toast";

export const useFaceDetection = (videoRef: RefObject<HTMLVideoElement | null>) => {
  const { t } = useTranslation();
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [warningMsg, setWarningMsg] = useState<string | null>(null);
  const incrementViolation = useTestStore((s) => s.incrementViolation);

  // Загрузка моделей (оставляем как есть, тут всё отлично)
  useEffect(() => {
    const loadModels = async () => {
      try {
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
          faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
        ]);
        setIsModelLoaded(true);
      } catch (e) {
        console.error("Ошибка загрузки моделей ИИ:", e);
      }
    };
    loadModels();
  }, []);

  // Оптимизированный цикл распознавания
  useEffect(() => {
    if (!isModelLoaded || !videoRef.current) return;

    let isRunning = true;
    let awayCounter = 0;
    
    // НАСТРОЙКИ ПРОИЗВОДИТЕЛЬНОСТИ
    const CHECK_INTERVAL_MS = 1000; // Проверяем 1 раз в секунду
    const MAX_AWAY_SECONDS = 3; // Даем 3 секунды форы перед нарушением

    const detectBehavior = async () => {
      if (!isRunning) return;

      // Если видео на паузе или не готово, просто ждем секунду и пробуем снова
      if (!videoRef.current || videoRef.current.paused) {
        setTimeout(detectBehavior, CHECK_INTERVAL_MS);
        return;
      }

      try {
        // Запускаем расчет
        const detection = await faceapi.detectSingleFace(
          videoRef.current, 
          new faceapi.TinyFaceDetectorOptions({ inputSize: 160, scoreThreshold: 0.5 })
        ).withFaceLandmarks();

        let currentWarning: string | null = null;

        if (!detection) {
          awayCounter++;
          currentWarning = t("proctoring.faceNotDetected");
        } else {
          // Математика поворота головы
          const nose = detection.landmarks.getNose()[0];
          const leftJaw = detection.landmarks.getJawOutline()[0];
          const rightJaw = detection.landmarks.getJawOutline()[16];

          const leftDist = nose.x - leftJaw.x;
          const rightDist = rightJaw.x - nose.x;
          const ratio = leftDist / rightDist;
          
          if (ratio > 2.5 || ratio < 0.4) {
            awayCounter++;
            currentWarning = t("proctoring.suspiciousGaze");
          } else {
            awayCounter = Math.max(0, awayCounter - 1);
          }
        }

        // ЗАЩИТА ОТ ТОРМОЗОВ REACT: Обновляем стейт ТОЛЬКО если текст реально изменился
        setWarningMsg((prev) => prev !== currentWarning ? currentWarning : prev);

        if (awayCounter >= MAX_AWAY_SECONDS) {
          incrementViolation();
          awayCounter = 0;
          toast.error(t("proctoring.violationToast"), { icon: '🤖' });
        }
      } catch (error) {
        console.error("Ошибка в процессе детекции:", error);
      }

      // ГЛАВНАЯ МАГИЯ: Планируем следующий кадр ТОЛЬКО после завершения текущего
      if (isRunning) {
        setTimeout(detectBehavior, CHECK_INTERVAL_MS);
      }
    };

    // Запускаем бесконечный цикл
    detectBehavior();

    return () => {
      isRunning = false; // Безопасно убиваем цикл при закрытии теста
    };
  }, [isModelLoaded, incrementViolation, videoRef]);

  return { isModelLoaded, warningMsg };
};