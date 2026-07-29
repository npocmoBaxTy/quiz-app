import { FormProvider, useForm } from "react-hook-form";
import { QuizConfiger } from "./components/QuizConfiger";
import { QuizHeader } from "./components/quizHeader";
import { QuizQuestions } from "./components/QuizQuestions";
import type { QuizFormValues } from "./types";
import { zodResolver } from "@hookform/resolvers/zod";
import { baseQuizSchema } from "./lib/schema";
import {
  Tabs,
  TabsList,
  TabsContent,
  TabsTrigger,
} from "@/app/components/ui/tabs";
import { useParams } from "react-router-dom";
import { useGetQuizForEdit } from "./api/creatQuiz";
import { transformBackendToForm } from "./utils/transformQuiz";
import { Loader } from "@/widgets/Loader/Loader";

export const QuizBuilder = () => {
  const { quizId } = useParams<{ quizId: string }>();
  const isEditMode = Boolean(quizId);

  const { data: editData, isLoading } = useGetQuizForEdit(quizId);

  const form = useForm<QuizFormValues>({
    defaultValues: {
      title: "Новый Тест",
      passing: 60,
      timeLimit: 50,
      published: false,
      questionsLimit: 1,
      questions: [
        {
          text: "",
          type: "single",
          points: 2,
          answers: [
            { text: "", isCorrect: true },
            { text: "", isCorrect: false },
            { text: "", isCorrect: false },
            { text: "", isCorrect: false },
          ],
        },
      ],
    },
    values: editData ? transformBackendToForm(editData) : undefined,
    resolver: zodResolver(baseQuizSchema),
    mode: "onBlur",
    reValidateMode: "onBlur",
    shouldUnregister: false,
  });

  if (quizId && isLoading) return <Loader />;

  return (
    <div className="quiz__builder--createor-wrapper bg-(--main-bg) w-full flex flex-col items-center justify-center relative pb-10">
      <div className="quiz__builder--inner w-225 relative pl-10">
        <FormProvider {...form}>
          <Tabs defaultValue="questions" className="pt-3 flex justify-center">
            <TabsList className="flex justify-center w-full bg-transparent">
              <TabsTrigger
                className="data-active:bg-white rounded-md"
                value="questions"
              >
                Вопросы
              </TabsTrigger>
              <TabsTrigger
                className="data-active:bg-white rounded-md"
                value="settings"
              >
                Настройки
              </TabsTrigger>
              <TabsTrigger
                className="data-active:bg-white rounded-md"
                value="free"
              >
                Бесплатно
              </TabsTrigger>
            </TabsList>
            <form>
              <TabsContent value="questions">
                <QuizHeader isEditMode={isEditMode} quizId={quizId} />
                <QuizQuestions />
              </TabsContent>
              <TabsContent value="settings">
                <QuizHeader
                  isEditMode={isEditMode}
                  breadcrumbs={true}
                  quizId={quizId}
                />
                <QuizConfiger />
              </TabsContent>
            </form>
          </Tabs>
        </FormProvider>
      </div>
    </div>
  );
};
