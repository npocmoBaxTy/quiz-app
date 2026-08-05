import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  useBlocker,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import { useQuizTaking, useQuizTakingById } from "./hooks/useQuizTaking";
import { QuestionBody } from "./QuizTakingBody/QuestionCard";
import { QuestionFooter } from "./QuizTakingFooter";
import { QuestionHeader } from "./QuizTakingHeader";
import { QuestionNavigator } from "./QuizTakingSidebar";
import { useTestStore } from "./store/store";
import { Loader } from "@/widgets/Loader/Loader";
import { Dialog } from "@/shared/ui/Dialog/Dialog";
import { Spinner } from "@/shared/ui/SPinner/Spinner";
import { QuizResultCard } from "./QuizResultCard";
import { AlertCircle, AlertTriangle, ArrowLeft } from "lucide-react";
import { useSubmitQuiz } from "./api/api";

export function QuizTaking() {
  const { t } = useTranslation();
  const { quizId } = useParams<{ quizId: string }>();

  const [searchParams] = useSearchParams();
  const attemptIdFromUrl = searchParams.get("attemptId");
  const submitMutation = useSubmitQuiz();
  const [isConfirmVisible, setConfirmVisible] = useState(false);

  const navigate = useNavigate();

  // Достаем нужные функции из стора
  const setAttemptId = useTestStore((s) => s.setAttemptId);
  const attemptId = useTestStore((s) => s.attemptId);
  const reset = useTestStore((s) => s.reset);
  const submitError = useTestStore((s) => s.submitError);
  const setScore = useTestStore((s) => s.setScore);
  const setIsSubmitting = useTestStore((s) => s.setIsSubmitting);
  const setMaxScore = useTestStore((s) => s.setMaxScore);

  const { data, isLoading: isQuestionsLoading } = useQuizTaking(quizId!);
  const { data: quizData, isLoading: isQuizLoading } = useQuizTakingById(
    quizId!,
  );

  const setQuestions = useTestStore((s) => s.setQuestions);
  const setQuiz = useTestStore((s) => s.setQuiz);

  const storeQuestions = useTestStore((s) => s.questions);

  const isSubmitting = useTestStore((s) => s.isSubmitting);
  const score = useTestStore((s) => s.score);
  const answers = useTestStore((s) => s.answers);

  useEffect(() => {
    reset();
  }, [quizId, reset]);

  useEffect(() => {
    if (data && quizData) {
      setQuestions(data.questions);
      setQuiz(quizData);
    }
  }, [data, quizData, setQuestions, setQuiz]);

  const isLocked = useTestStore((s) => s.isLocked);
  const lockReason = useTestStore((s) => s.lockReason);

  const answeredCount = Object.keys(answers || {}).length;
  const totalQuestions = storeQuestions.length;
  const unansweredCount = totalQuestions - answeredCount;
  const shouldBlock = answeredCount > 0 && score === null && !isSubmitting;

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (shouldBlock) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [shouldBlock]);

  useEffect(() => {
    // Если в URL есть ID, а в сторе его еще нет — записываем!
    if (attemptIdFromUrl && !attemptId) {
      setAttemptId(attemptIdFromUrl);
    }
  }, [attemptIdFromUrl, attemptId, setAttemptId]);

  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      shouldBlock && currentLocation.pathname !== nextLocation.pathname,
  );

  const handleConfirmSubmit = () => {
    if (!attemptId || !quizId) return;

    setIsSubmitting(true);

    const formattedResponses = Object.entries(answers).map(([qId, values]) => {
      const question = data?.questions.find((q) => q.id === qId);
      return {
        questionId: qId,
        type: question?.type || "multiple",
        values: values as string[],
      };
    });

    submitMutation.mutate(
      {
        attemptId,
        responses: formattedResponses,
      },
      {
        onSuccess: (responseData) => {
          setScore(responseData.score);

          // 🔥 ДОБАВЛЕНО: Сохраняем максимальный балл за этот конкретный билет
          if (responseData.maxScore !== undefined) {
            setMaxScore(responseData.maxScore);
          }
        },
        onSettled: () => setIsSubmitting(false),
      },
    );
  };

  useEffect(() => {
    if (isLocked && !submitMutation.isPending && score === null) {
      handleConfirmSubmit();
    }
  }, [isLocked, score]);

  if (!quizId) return <div>Invalid quiz</div>;

  if (isQuestionsLoading || isQuizLoading || storeQuestions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
        <Loader />
      </div>
    );
  }
  if (score !== null) {
    const maxScore = storeQuestions.reduce(
      (sum, q) => sum + (q.points || 0),
      0,
    );

    return (
      <QuizResultCard
        score={score}
        maxScore={maxScore}
        passingPercentage={quizData?.passing}
      />
    );
  }
  if (isLocked || isSubmitting) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-1 bg-[#F8FAFC] p-10 text-center">
        <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-6"></div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">
          {!isLocked
            ? t("quizTaking.savingTitle")
            : lockReason === "time_expired"
              ? t("quizTaking.timeExpiredTitle")
              : t("quizTaking.lockedTitle")}
        </h2>
        <p className="text-slate-500 max-w-md">
          {t("quizTaking.savingHint")}
        </p>
      </div>
    );
  }

  if (submitError) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-1 bg-[#F8FAFC] p-10 text-center">
        <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center mb-6">
          <AlertCircle className="text-rose-500" size={32} />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">
          {t("quizTaking.errorTitle")}
        </h2>
        <p className="text-slate-500 max-w-md mb-8">{submitError}</p>
        <button
          onClick={() => navigate("/student/quizes")} // Путь к списку тестов
          className="flex items-center gap-2 bg-slate-900 hover:bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-sm active:scale-95"
        >
          <ArrowLeft size={18} /> {t("quizTaking.backToList")}
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="quiz__taking--wrapper min-h-screen bg-[#F8FAFC] flex flex-col font-sans">
        <QuestionHeader onFinishClick={() => setConfirmVisible(true)} />

        <div className="flex-1 max-w-7xl mx-auto w-full flex flex-col lg:flex-row gap-6 p-4 sm:p-8">
          <main className="flex-1 flex flex-col">
            <QuestionBody />
            <QuestionFooter />
          </main>

          <QuestionNavigator onFinishClick={() => setConfirmVisible(true)} />
        </div>
      </div>

      {/* Модальное окно подтверждения завершения теста */}
      <Dialog onClose={() => setConfirmVisible(false)} visible={isConfirmVisible}>
        <h2 className="text-xl font-bold text-slate-900 mb-3">
          {t("quizTaking.footer.readyTitle")}
        </h2>

        <p className="text-slate-500 mb-6">
          {t("quizTaking.footer.cannotReturn")}
        </p>

        <div className="bg-slate-50 rounded-xl p-4 mb-6 border border-slate-100">
          <div className="flex justify-between items-center mb-2">
            <span className="text-slate-500 font-medium text-sm">{t("quizTaking.footer.totalQuestions")}</span>
            <span className="font-bold text-slate-900">{totalQuestions}</span>
          </div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-slate-500 font-medium text-sm">{t("quizTaking.footer.answeredCount")}</span>
            <span className="font-bold text-emerald-600">{answeredCount}</span>
          </div>

          {unansweredCount > 0 && (
            <div className="flex justify-between items-center pt-2 border-t border-slate-200 mt-2">
              <span className="text-rose-500 font-bold text-sm">{t("quizTaking.footer.skipped")}</span>
              <span className="font-bold text-rose-500">{unansweredCount}</span>
            </div>
          )}
        </div>

        {unansweredCount > 0 && (
          <div className="mb-6 p-3.5 bg-amber-50 border border-amber-100 text-amber-800 text-sm rounded-xl flex items-start gap-2.5 text-left">
            <AlertTriangle size={16} className="shrink-0 mt-0.5" />
            <p>{t("quizTaking.footer.unansweredWarning")}</p>
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={() => setConfirmVisible(false)}
            disabled={isSubmitting}
            className="flex-1 px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors disabled:opacity-50"
          >
            {t("quizTaking.footer.cancel")}
          </button>

          <button
            onClick={handleConfirmSubmit}
            disabled={isSubmitting}
            className="flex-1 px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-colors disabled:opacity-50 flex justify-center items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Spinner />
                {t("quizTaking.footer.sending")}
              </>
            ) : (
              t("quizTaking.footer.confirmFinish")
            )}
          </button>
        </div>
      </Dialog>

      {/* Модальное окно для подтверждения выхода */}
      {blocker.state === "blocked" && (
        <Dialog visible={true}>
          <>
            <div className="w-14 h-14 mx-auto rounded-full bg-rose-50 text-rose-500 flex items-center justify-center mb-4">
              <AlertCircle size={26} />
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-3">{t("quizTaking.attentionTitle")}</h2>
            <p className="text-slate-500 mb-6">
              {t("quizTaking.leaveConfirm")}
              <br />
              <span className="font-semibold text-slate-800">
                {t("quizTaking.leaveConfirmStrong")}
              </span>
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => blocker.reset()}
                className="flex-1 px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors"
              >
                {t("quizTaking.stayButton")}
              </button>
              <button
                onClick={() => blocker.proceed()}
                className="flex-1 px-6 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl transition-colors"
              >
                {t("quizTaking.leaveButton")}
              </button>
            </div>
          </>
        </Dialog>
      )}
    </>
  );
}
