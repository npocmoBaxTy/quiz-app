import type { Quiz } from "../types";
import { QuizesCard } from "@/app/components/cards/QuizCard/QuizCard";
import { useNavigate } from "react-router-dom";
import { useStartQuiz } from "./../hooks/useGetQuizzesList";
import { Loader } from "@/widgets/Loader/Loader";

export const QuizesList = ({ data }: { data: Quiz[] | undefined }) => {
  const navigate = useNavigate();
  const startMutation = useStartQuiz();

  const handleStart = (quizId: string) => {
    startMutation.mutate(quizId, {
      onSuccess: (data) => {
        navigate(`/student/quiz/${quizId}?attemptId=${data.attemptId}`);
      },
    });
  };
  if (!data) {
    return <Loader />;
  }
  return (
    <>

      {/* <!-- Сетка тестов --> */}
      <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-3 gap-6 relative justify-items-center">
        {data?.map((quiz) => (
          <QuizesCard
            key={quiz.id}
            quiz={quiz}
            clickHandler={() => handleStart(quiz.id)}
          />
        ))}
      </div>
    </>
  );
};
