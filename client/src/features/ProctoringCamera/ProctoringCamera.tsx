// ProctoringCamera.tsx
import { useRef } from "react";
import { CameraOff, AlertTriangle, ShieldAlert, BrainCircuit } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useTestStore } from "@/pages/QuizTaking/store/store";


import { useFocusTracking } from "./hooks/useFaceTracking";
import { useWebcam } from "./hooks/useWebCam";
import { useFaceDetection } from "./hooks/useFaceDetection";

export const ProctoringCamera = () => {
  const { t } = useTranslation();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const violations = useTestStore((s) => s.violations);
  const maxViolations = useTestStore((s) => s.maxViolations);

  useFocusTracking();
  const { isModelLoaded, warningMsg } = useFaceDetection(videoRef);
  const { error } = useWebcam(videoRef, isModelLoaded);

  const violationPercentage = Math.min((violations / maxViolations) * 100, 100);
  const progressColor = violations === 0 ? "bg-green-500" : violations < maxViolations ? "bg-amber-500" : "bg-red-600";

  return (
    <div className="bg-white rounded-md border border-slate-200 overflow-hidden shadow-xl flex flex-col w-96 ml-10">
      
      {/* Шапка */}
      <div className="bg-slate-900 px-3 py-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {!error && isModelLoaded && <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>}
          <span className="text-xs font-bold text-white uppercase tracking-wider">
            {isModelLoaded ? t("proctoring.active") : t("proctoring.modelInit")}
          </span>
        </div>
        {isModelLoaded && <BrainCircuit size={16} className="text-indigo-400" />}
      </div>

      {/* Видео */}
      <div className="relative bg-slate-100 aspect-video flex items-center justify-center">
        {warningMsg && (
          <div className="absolute top-2 left-2 right-2 bg-red-500/90 text-white text-xs font-bold px-3 py-1.5 rounded-md z-10 text-center animate-pulse shadow-md">
            {warningMsg}
          </div>
        )}
        
        {error ? (
          <div className="p-4 text-center flex flex-col items-center">
            <CameraOff size={32} className="text-slate-400 mb-2" />
            <p className="text-xs font-medium text-red-500 flex items-center gap-1">
              <AlertTriangle size={14} className="shrink-0" /> {error}
            </p>
          </div>
        ) : (
          <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover transform -scale-x-100" />
        )}
      </div>

      {/* Статистика нарушений */}
      <div className="bg-white px-4 py-3 border-t border-slate-100">
        <div className="flex justify-between items-end mb-2">
          <div className="flex items-center gap-1.5 text-slate-500">
            <ShieldAlert size={14} />
            <span className="text-[10px] font-bold uppercase tracking-wider">{t("proctoring.violations")}</span>
          </div>
          <div className="text-right">
            <span className={`text-sm font-bold ${violations >= maxViolations ? 'text-red-600' : violations > 0 ? 'text-amber-500' : 'text-slate-700'}`}>
              {violations}
            </span>
            <span className="text-xs text-slate-400 font-medium"> / {maxViolations}</span>
          </div>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
          <div className={`h-full transition-all duration-500 ease-out ${progressColor}`} style={{ width: `${violationPercentage}%` }}></div>
        </div>
      </div>

    </div>
  );
};