// hooks/useWebcam.ts
import { useEffect, useState, type RefObject } from "react";
import { useTranslation } from "react-i18next";

export const useWebcam = (
  videoRef: RefObject<HTMLVideoElement | null>,
  isModelLoaded: boolean,
) => {
  const { t } = useTranslation();
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
            setError(t("proctoring.cameraLost"));
            // Тут можно даже дернуть функцию incrementViolation() из вашего Zustand-стора
          };
        }
      } catch (err: unknown) {
        if (err instanceof DOMException || err instanceof Error) {
          if (err.name === "NotAllowedError") {
            setError(t("proctoring.accessDenied"));
          } else if (err.name === "NotFoundError") {
            setError(t("proctoring.cameraNotFound"));
          } else if (err.name === "NotReadableError") {
            // 🔥 Часто бывает, если камера уже занята другой программой (Zoom, OBS)
            setError(t("proctoring.cameraBusy"));
          } else {
            setError(t("proctoring.genericError", { message: err.message }));
          }
        } else {
          setError(t("proctoring.unknownError"));
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
