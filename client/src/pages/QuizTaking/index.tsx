import { useEffect } from "react";
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
import { useTestStore } from "./store/store";
import { Loader } from "@/widgets/Loader/Loader";
import { Dialog } from "@/shared/ui/Dialog/Dialog";
import { QuizResultCard } from "./QuizResultCard";
import { ProctoringCamera } from "@/features/ProctoringCamera/ProctoringCamera";
import { AlertCircle, ArrowLeft } from "lucide-react";
import { useSubmitQuiz } from "./api/api";

export function QuizTaking() {
  const { quizId } = useParams<{ quizId: string }>();

  const [searchParams] = useSearchParams();
  const attemptIdFromUrl = searchParams.get("attemptId");
  const submitMutation = useSubmitQuiz();

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

  const answeredCount = Object.keys(answers || {}).length;
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

    // 🔥 ДОБАВЛЕНО: Собираем ID ВСЕХ вопросов, которые вывелись студенту на экран
    const allQuestionIds = data?.questions.map((q) => q.id) || [];

    submitMutation.mutate(
      {
        attemptId,
        quizId,
        ticketQuestionIds: allQuestionIds, // Отправляем полный список на бэкенд
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
    return <Loader />;
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
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-10 text-center">
        <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-6"></div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">
          {isLocked ? "Тест прерван за нарушения" : "Сохранение результатов..."}
        </h2>
        <p className="text-slate-500 max-w-md">
          Пожалуйста, подождите. Ваши ответы автоматически отправляются на
          сервер. Не закрывайте вкладку.
        </p>
      </div>
    );
  }

  if (submitError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-10 text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-6">
          <AlertCircle className="text-red-500" size={32} />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">
          Ой, что-то пошло не так
        </h2>
        <p className="text-slate-600 max-w-md mb-8">{submitError} </p>
        <button
          onClick={() => navigate("/student/quizes")} // Путь к списку тестов
          className="flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-xl hover:bg-slate-800 transition-colors font-medium"
        >
          <ArrowLeft size={18} /> Вернуться к списку тестов
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="quiz__taking--wrapper mx-auto flex items-start justify-center w-full lg:p-10 md:p-5 sm:p-3 max-w-[80%]">
        <div className="question__card--wrapper min-h-160 flex flex-col justify-between p-3 border rounded-md bg-white w-full">
          <QuestionHeader />
          <QuestionBody />
          <QuestionFooter
            isSubmitting={isSubmitting}
            onConfirmSubmit={handleConfirmSubmit}
          />
        </div>
        <ProctoringCamera />
      </div>

      {/* Модальное окно для подтверждения выхода */}
      {blocker.state === "blocked" && (
        <Dialog visible={true}>
          <>
            <h2 className="text-2xl font-bold text-red-600 mb-4">Внимание!</h2>
            <p className="text-gray-700 mb-6">
              Вы уверены, что хотите покинуть страницу?
              <br />
              <span className="font-semibold text-gray-900">
                Результаты не будут сохранены, а возможность пересдачи будет
                аннулирована.
              </span>
            </p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => blocker.reset()}
                className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition"
              >
                Остаться и продолжить
              </button>
              <button
                onClick={() => blocker.proceed()}
                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
              >
                Покинуть тест
              </button>
            </div>
          </>
        </Dialog>
      )}
    </>
  );
}
