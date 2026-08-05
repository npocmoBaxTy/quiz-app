import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
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
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export const QuizBuilder = () => {
  const { t } = useTranslation();
  const { quizId } = useParams<{ quizId: string }>();
  const isEditMode = Boolean(quizId);
  const [activeTab, setActiveTab] = useState("questions");

  const { data: editData, isLoading } = useGetQuizForEdit(quizId);

  const form = useForm<QuizFormValues>({
    defaultValues: {
      title: t("quizBuilder.defaultQuizTitle"),
      passing: 60,
      timeLimit: 50,
      published: false,
      questionsLimit: 1,
      questions: [
        {
          text: "",
          type: "single",
          points: 2,
          imageUrl: "",
          answers: [
            { text: "", isCorrect: true, imageUrl: "" },
            { text: "", isCorrect: false, imageUrl: "" },
            { text: "", isCorrect: false, imageUrl: "" },
            { text: "", isCorrect: false, imageUrl: "" },
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
    <div className="quiz__builder--createor-wrapper bg-(--main-bg) w-full flex flex-col items-center justify-start relative min-h-screen">
      <div className="quiz__builder--inner w-225 relative pl-10">
        <FormProvider {...form}>
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="pt-3 flex justify-center"
          >

            <TabsList className="flex justify-center items-center w-full bg-transparent">
              <Link to="/teacher/quizes" className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 transition-colors mr-3">
                <ArrowLeft size={15} className="text-gray-500 hover:text-gray-700 mb-1" />
                {t("quizBuilder.backToQuizzes")}
              </Link>
              <TabsTrigger
                className="data-active:bg-white rounded-md"
                value="questions"
              >
                {t("quizBuilder.tabsPage.questions")}
              </TabsTrigger>
              <TabsTrigger
                className="data-active:bg-white rounded-md"
                value="settings"
              >
                {t("quizBuilder.tabsPage.settings")}
              </TabsTrigger>
              <TabsTrigger
                className="data-active:bg-white rounded-md"
                value="free"
              >
                {t("quizBuilder.tabsPage.free")}
              </TabsTrigger>
            </TabsList>
            <form>
              <TabsContent value="questions">
                <QuizHeader
                  isEditMode={isEditMode}
                  quizId={quizId}
                  onNeedsTab={setActiveTab}
                />
                <QuizQuestions />
              </TabsContent>
              <TabsContent value="settings">
                <QuizHeader
                  isEditMode={isEditMode}
                  breadcrumbs={true}
                  quizId={quizId}
                  onNeedsTab={setActiveTab}
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
