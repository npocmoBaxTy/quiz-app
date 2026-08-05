import { FieldInput } from "@/features/auth/ui/FieldInput";
import { Sigma, Text } from "lucide-react";
import { useFormContext, useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";

export const QuestionFooter = ({ qIndex }: { qIndex: number }) => {
  const { register, setValue, control } = useFormContext();
  const { t } = useTranslation();

  const points = useWatch({
    control,
    name: `questions.${qIndex}.points`,
  });

  const changeWeight = (value: number) => {
    if (value >= 1) {
      setValue(`questions.${qIndex}.points`, value, {
        shouldDirty: true,
      });
    }
  };

  return (
    <div className="flex items-center gap-2 p-4">
      <div className="w-1/4">
        <FieldInput
          type="number"
          label={t("quizBuilder.pointsLabel")}
          value={points || 1}
          textChange={(e) => changeWeight(Number(e.target.value))}
        >
          <Sigma size={14} />
        </FieldInput>
      </div>

      <div className="w-3/4">
        <FieldInput
          type="text"
          label={t("quizBuilder.explanationLabel")}
          placeholder={t("quizBuilder.explanationPlaceholder")}
          {...register(`questions.${qIndex}.description`)}
        >
          <Text size={14} />
        </FieldInput>
      </div>
    </div>
  );
};
