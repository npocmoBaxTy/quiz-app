// hooks/useWebcam.ts
import { useEffect, useState, type RefObject } from "react";

export const useWebcam = (
  videoRef: RefObject<HTMLVideoElement | null>,
  isModelLoaded: boolean,
) => {
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Ждем, пока ИИ загрузится
    if (!isModelLoaded) return;

    let currentStream: MediaStream | null = null;

    const startCamera = async () => {
      try {
        // Используем ideal-параметры. Браузер сам подберет максимально близкое разрешение
        // без риска выдать OverconstrainedError. Ограничиваем FPS для экономии батареи.
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: "user",
            width: { ideal: 480 },
            height: { ideal: 360 },
            frameRate: { ideal: 10, max: 15 },
          },
        });

        currentStream = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }

        // ПРОКТОРИНГ: Отлавливаем аппаратное отключение камеры (выдернули шнур)
        const videoTrack = stream.getVideoTracks()[0];
        if (videoTrack) {
          videoTrack.onended = () => {
            setError(
              "Связь с веб-камерой потеряна. Пожалуйста, проверьте подключение.",
            );
            // Тут можно даже дернуть функцию incrementViolation() из вашего Zustand-стора
          };
        }
      } catch (err: unknown) {
        if (err instanceof DOMException || err instanceof Error) {
          if (err.name === "NotAllowedError") {
            setError(
              "Доступ к камере запрещен. Разрешите доступ в настройках браузера.",
            );
          } else if (err.name === "NotFoundError") {
            setError("Камера не найдена. Подключите устройство.");
          } else if (err.name === "NotReadableError") {
            // 🔥 Часто бывает, если камера уже занята другой программой (Zoom, OBS)
            setError(
              "Камера занята другим приложением. Закройте Zoom/Skype и обновите страницу.",
            );
          } else {
            setError(`Ошибка: ${err.message}`);
          }
        } else {
          setError("Произошла неизвестная ошибка при доступе к камере.");
        }
      }
    };

    startCamera();

    return () => {
      // Правильная и полная очистка при размонтировании
      if (currentStream) {
        currentStream.getTracks().forEach((track) => track.stop());
      }
      if (videoRef.current) {
        videoRef.current.srcObject = null; // Отвязываем поток от DOM-элемента
      }
    };
  }, [isModelLoaded, videoRef]);

  return { error };
};
