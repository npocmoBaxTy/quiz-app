import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Check,
  CheckCircle2,
  X,
  XCircle,
  AlertTriangle,
  FileText,
  Trophy,
} from "lucide-react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useAttemptDetails } from "./hooks/useStudentAttemptDetails";
import { Pagination } from "@/shared/ui/Pagination/Pagination";
import { resolveMediaUrl } from "@/shared/api/resolveMediaUrl";
import { Loader } from "@/widgets/Loader/Loader";
import { useState } from "react";

export const StudentResultDetailsPage = () => {
  const { attemptId } = useParams<{ attemptId: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [currentPage, setCurrentPage] = useState(1);

  const { data, isLoading, isError } = useAttemptDetails(
    attemptId,
    currentPage,
  );

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (isLoading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
        <Loader />
      </div>
    );

  if (isError || !data)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 bg-[#F8FAFC] text-center px-4">
        <div className="w-14 h-14 rounded-full bg-red-50 text-red-500 flex items-center justify-center">
          <AlertTriangle size={26} />
        </div>
        <p className="text-slate-700 font-bold">{t("resultDetails.loadError")}</p>
        <p className="text-slate-400 text-sm">
          {t("resultDetails.loadErrorHint")}
        </p>
      </div>
    );

  const percentage =
    data.maxScore > 0 ? Math.round((data.score / data.maxScore) * 100) : 0;
  const isPassed = percentage >= 60;

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-800 pb-20">
      <div className="max-w-4xl mx-auto pt-8 px-4">
        {/* Кнопка "Назад" */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-indigo-600 transition-colors mb-6 bg-white border border-slate-200 hover:border-indigo-200 rounded-xl px-4 py-2.5 shadow-sm"
        >
          <ArrowLeft size={16} /> {t("resultDetails.back")}
        </button>

        {/* Шапка с общим итогом */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-linear-to-br from-indigo-900 via-indigo-800 to-violet-900 rounded-[24px] p-6 md:p-8 text-white relative overflow-hidden shadow-xl shadow-indigo-900/10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
          <div className="absolute bottom-0 left-0 w-40 h-40 bg-indigo-500 opacity-20 rounded-full blur-2xl translate-y-1/3 -translate-x-1/4"></div>

          <div className="relative z-10">
            <div
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold mb-3 ${
                isPassed
                  ? "bg-emerald-400/15 text-emerald-300"
                  : "bg-rose-400/15 text-rose-300"
              }`}
            >
              {isPassed ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
              {isPassed ? t("resultDetails.passed") : t("resultDetails.failed")}
            </div>
            <p className="text-sm font-bold text-indigo-200 uppercase tracking-wider mb-1">
              {t("resultDetails.mistakesReview")}
            </p>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight max-w-lg">
              {data.quizTitle}
            </h1>
          </div>

          <div className="relative z-10 flex items-center gap-4 sm:gap-6 bg-white/10 backdrop-blur-sm px-5 sm:px-6 py-4 rounded-2xl border border-white/10 shrink-0">
            <div className="text-center">
              <p className="text-[10px] text-indigo-200 font-bold uppercase tracking-wider mb-1">
                {t("resultDetails.yourScore")}
              </p>
              <p className="text-2xl font-black leading-none">
                {data.score}
                <span className="text-base text-indigo-300 font-medium">
                  {" "}
                  / {data.maxScore}
                </span>
              </p>
            </div>
            <div className="w-px h-10 bg-white/15"></div>
            <div className="text-center">
              <p className="text-[10px] text-indigo-200 font-bold uppercase tracking-wider mb-1">
                {t("resultDetails.successRate")}
              </p>
              <p
                className={`text-2xl font-black leading-none ${isPassed ? "text-emerald-300" : "text-rose-300"}`}
              >
                {percentage}%
              </p>
            </div>
            <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center shrink-0">
              <Trophy
                size={18}
                className={isPassed ? "text-amber-300" : "text-indigo-300"}
              />
            </div>
          </div>
        </motion.div>

        {/* Список вопросов */}
        <div className="space-y-5">
          {data.questions.map((question, index) => {
            const isFullyCorrect = question.earnedPoints === question.maxPoints;
            const isWrong = question.earnedPoints === 0;
            const cardBorderColor = isFullyCorrect
              ? "border-indigo-200"
              : isWrong
                ? "border-rose-200"
                : "border-amber-200";
            const badgeColor = isFullyCorrect
              ? "bg-indigo-50 text-indigo-600"
              : isWrong
                ? "bg-rose-50 text-rose-600"
                : "bg-amber-50 text-amber-600";
            const StatusIcon = isFullyCorrect ? (
              <CheckCircle2 size={16} />
            ) : (
              <XCircle size={16} />
            );

            const globalQuestionNumber =
              (data.meta.page - 1) * data.meta.limit + index + 1;

            return (
              <motion.div
                key={question.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.04 }}
                className={`bg-white rounded-[20px] p-5 sm:p-7 border shadow-sm hover:shadow-md transition-shadow ${cardBorderColor}`}
              >
                <div className="flex items-start justify-between gap-4 mb-5">
                  <div className="flex items-start gap-3">
                    <span className="mt-0.5 w-7 h-7 shrink-0 rounded-full bg-slate-100 text-slate-500 text-xs font-black flex items-center justify-center">
                      {globalQuestionNumber}
                    </span>
                    <h3 className="text-base sm:text-lg font-bold text-slate-800 leading-snug break-all">
                      {question.text}
                    </h3>
                  </div>

                  <span
                    className={`shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-bold ${badgeColor}`}
                  >
                    {StatusIcon}
                    {question.earnedPoints}/{question.maxPoints}
                  </span>
                </div>

                {question.imageUrl && (
                  <img
                    src={resolveMediaUrl(question.imageUrl)}
                    alt=""
                    className="mb-5 sm:ml-10 max-h-80 rounded-xl border border-slate-200 object-contain"
                  />
                )}

                {/* Варианты ответов */}
                <div className="space-y-2.5 sm:pl-10">
                  {question.type === "text" ? (
                    <div
                      className={`px-5 py-4 rounded-xl border ${isWrong ? "bg-rose-50/60 border-rose-100" : "bg-emerald-50/60 border-emerald-100"}`}
                    >
                      <p
                        className={`flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider mb-2 ${isWrong ? "text-rose-500/80" : "text-emerald-600/80"}`}
                      >
                        <FileText size={13} /> {t("resultDetails.yourAnswer")}
                      </p>
                      <p
                        className={`font-medium ${isWrong ? "text-rose-900" : "text-emerald-900"}`}
                      >
                        {question.studentAnswers[0] || t("resultDetails.noAnswer")}
                      </p>
                    </div>
                  ) : (
                    <>
                      {question.studentAnswers.length === 0 && (
                        <div className="flex items-center gap-2 px-5 py-3 rounded-xl border border-amber-200 bg-amber-50 text-amber-800 text-sm font-semibold">
                          <AlertTriangle size={16} className="shrink-0" />
                          {t("resultDetails.notAnswered")}
                        </div>
                      )}

                      {question.options.map((opt) => {
                        const isSelected = question.studentAnswers.includes(
                          opt.id,
                        );
                        const isCorrectAnswer = opt.isCorrect;

                        let optionClass = "";

                        if (isSelected && isCorrectAnswer) {
                          optionClass =
                            "bg-emerald-50 text-emerald-800 border-emerald-200 shadow-sm";
                        } else if (isSelected && !isCorrectAnswer) {
                          optionClass =
                            "bg-rose-50 text-rose-800 border-rose-200 shadow-sm";
                        } else {
                          optionClass =
                            "bg-[#F8FAFC] text-slate-600 border-transparent";
                        }

                        return (
                          <div
                            key={opt.id}
                            className={`px-5 py-3.5 border rounded-xl transition-colors font-medium text-[15px] leading-relaxed flex items-center justify-between gap-4 ${optionClass}`}
                          >
                            <span className="flex items-center gap-3">
                              {opt.imageUrl && (
                                <img
                                  src={resolveMediaUrl(opt.imageUrl)}
                                  alt=""
                                  className="h-14 w-14 shrink-0 rounded-lg border border-slate-200 object-cover"
                                />
                              )}
                              {opt.text}
                            </span>

                            {isSelected && (
                              <span
                                className={`flex items-center gap-1.5 shrink-0 text-[10px] font-bold uppercase tracking-wider pl-2.5 pr-1.5 py-1 rounded-full ${isCorrectAnswer ? "bg-emerald-600/10 text-emerald-700" : "bg-rose-600/10 text-rose-700"}`}
                              >
                                {t("resultDetails.yourAnswer")}
                                {isCorrectAnswer ? (
                                  <Check size={14} className="shrink-0" />
                                ) : (
                                  <X size={14} className="shrink-0" />
                                )}
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        {data.meta && data.meta.totalPages > 1 && (
          <div className="mt-10">
            <Pagination
              currentPage={data.meta.page}
              totalPages={data.meta.totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        )}
      </div>
    </div>
  );
};
