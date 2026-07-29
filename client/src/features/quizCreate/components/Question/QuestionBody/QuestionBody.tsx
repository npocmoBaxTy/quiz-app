import { Text } from "lucide-react";
import { AnswerItem } from "../AnswerItem/Answers";
import { useFormContext } from "react-hook-form";
import { C } from "@/features/auth/constants";
import { memo } from "react";

type Props = {
  qIndex: number;
};

export const QuestionBody = memo(({ qIndex }: Props) => {
  const { register } = useFormContext();
  return (
    <div className="question__body p-4">
      <div className="question__title--input mb-4">
        <h1 className="text-sm text-muted-foreground mb-2">ТЕКСТ ВОПРОСА</h1>
        <div
          className="flex rounded-md p-4"
          style={{ border: `1px solid ${C.border}` }}
        >
          <Text size={14} className="mr-4" />
          <textarea
            {...register(`questions.${qIndex}.text`)}
            placeholder="Введите текст вопроса...."
            rows={4}
            className="outline-none resize-none w-full [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-gray-400 overflow-y-auto [&::-webkit-scrollbar-thumb]:rounded-[3px]"
          />
        </div>
      </div>
      <div className="question__answers flex flex-col gap-2 w-full">
        <AnswerItem qIndex={qIndex} />
      </div>
    </div>
  );
});

QuestionBody.displayName = "QuestionBody";
