import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { CheckCircle2, XCircle } from "lucide-react";

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
  const { t } = useTranslation();

  // Логика подсчета вынесена внутрь самого компонента
  const percentage = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
  const isSuccess = percentage >= passingPercentage;

  return (
    <div className="quiz__result--wrapper min-h-screen bg-[#F8FAFC] flex items-center justify-center w-full p-5">
      <div className="bg-white p-8 md:p-10 rounded-[24px] border border-slate-200 shadow-sm flex flex-col items-center max-w-md w-full animate-in fade-in zoom-in duration-500">
        <div
          className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 ${isSuccess ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"}`}
        >
          {isSuccess ? <CheckCircle2 size={40} /> : <XCircle size={40} />}
        </div>

        <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">
          {isSuccess ? t("quizTaking.result.congrats") : t("quizTaking.result.finished")}
        </h2>
        <p className="text-slate-500 text-center mb-8">
          {t("quizTaking.result.savedHint")}
        </p>

        {/* Блок с баллами */}
        <div className="bg-slate-50 rounded-2xl p-6 w-full text-center mb-8 border border-slate-100">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
            {t("quizTaking.result.yourResult")}
          </div>
          <div className="text-5xl font-black text-indigo-600 mb-2">
            {score}{" "}
            <span className="text-2xl text-slate-400">/ {maxScore || "?"}</span>
          </div>
          <div className={`text-sm font-bold ${isSuccess ? "text-emerald-600" : "text-rose-500"}`}>
            {t("quizTaking.result.correctPercent", { percentage })}
          </div>
        </div>

        {/* Кнопка возврата к списку */}
        <button
          onClick={() => navigate("/student/quizes", { replace: true })}
          className="w-full py-3.5 bg-slate-900 hover:bg-indigo-600 text-white font-bold rounded-xl transition-all shadow-sm active:scale-95"
        >
          {t("quizTaking.result.backToList")}
        </button>
      </div>
    </div>
  );
}
