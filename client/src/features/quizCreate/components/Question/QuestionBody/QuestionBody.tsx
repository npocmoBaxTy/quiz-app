import { Text } from "lucide-react";
import { AnswerItem } from "../AnswerItem/Answers";
import { Controller, useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { C } from "@/features/auth/constants";
import { memo } from "react";
import { ImageUpload } from "../../ImageUpload/ImageUpload";

type Props = {
  qIndex: number;
};

export const QuestionBody = memo(({ qIndex }: Props) => {
  const { register, control } = useFormContext();
  const { t } = useTranslation();
  return (
    <div className="question__body p-4">
      <div className="question__title--input mb-4">
        <h1 className="text-sm text-muted-foreground mb-2">{t("quizBuilder.questionTextLabel")}</h1>
        <div
          className="flex items-start gap-3 rounded-md p-4"
          style={{ border: `1px solid ${C.border}` }}
        >
          <Text size={14} className="mt-1 mr-1" />
          <textarea
            {...register(`questions.${qIndex}.text`)}
            placeholder={t("quizBuilder.questionTextPlaceholder")}
            rows={4}
            className="outline-none resize-none w-full [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-gray-400 overflow-y-auto [&::-webkit-scrollbar-thumb]:rounded-[3px]"
          />
          <Controller
            name={`questions.${qIndex}.imageUrl`}
            control={control}
            render={({ field }) => (
              <ImageUpload value={field.value} onChange={field.onChange} />
            )}
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
