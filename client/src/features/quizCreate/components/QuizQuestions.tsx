import { C } from "@/features/auth/constants";
import { QuizTabs } from "./Tabs/Index";

export const QuizQuestions = () => {
  return (
    <div
      className="quiz__creator--question mt-5 overflow-hidden rounded-xl pt-2"
      style={{ background: C.surfaceHigh }}
    >
      <div className="quiz__question--tabs w-full">
        <QuizTabs />
      </div>
    </div>
  );
};
