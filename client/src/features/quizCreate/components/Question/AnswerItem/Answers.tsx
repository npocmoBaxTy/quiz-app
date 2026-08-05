import {
  Controller,
  useFieldArray,
  useFormContext,
  useWatch,
} from "react-hook-form";
import { RadioGroup, RadioGroupItem } from "@/app/components/ui/radio-group";
import { Checkbox } from "@/app/components/ui/checkbox";
import { FieldInput } from "@/features/auth/ui/FieldInput";
import { Option, X, Type } from "lucide-react";
import { useTranslation } from "react-i18next";
import { AddAnswer } from "./AddAnswer";
import { ImageUpload } from "../../ImageUpload/ImageUpload";

type Props = {
  qIndex: number;
};

export const AnswerItem = ({ qIndex }: Props) => {
  const { control, setValue } = useFormContext();
  const { t } = useTranslation();

  const { fields, remove, append } = useFieldArray({
    control,
    name: `questions.${qIndex}.answers`,
  });

  const questionType = useWatch({
    control,
    name: `questions.${qIndex}.type`,
  });

  const isCorrectValues = useWatch({
    control,
    name: fields.map((_, i) => `questions.${qIndex}.answers.${i}.isCorrect`),
  }) as boolean[]; // Вернет что-то вроде [false, true, false]

  // Логика для Radio (Single)
  const setCorrectSingle = (selectedIndex: number) => {
    fields.forEach((_, i) => {
      setValue(
        `questions.${qIndex}.answers.${i}.isCorrect`,
        i === selectedIndex,
        {
          shouldDirty: true,
        },
      );
    });
  };

  // Логика для Checkbox (Multiple)
  const toggleCorrectMultiple = (aIndex: number, checked: boolean) => {
    setValue(`questions.${qIndex}.answers.${aIndex}.isCorrect`, checked, {
      shouldDirty: true,
    });
  };

  if (questionType === "text") {
    return (
      <div className="mt-2 p-4 border rounded-md bg-muted/20 flex items-center gap-2">
        <Type size={16} className="text-muted-foreground" />
        <span className="text-xs text-muted-foreground">
          {t("quizBuilder.textTypeHint")}
        </span>
      </div>
    );
  }

  const renderSelector = (i: number) => {
    if (questionType === "multiple") {
      return (
        <Checkbox
          checked={isCorrectValues[i] || false}
          onCheckedChange={(checked: boolean) =>
            toggleCorrectMultiple(i, !!checked)
          }
        />
      );
    }

    return (
      <RadioGroupItem
        value={i.toString()}
        id={`q-${qIndex}-a-${i}`}
        checked={isCorrectValues[i] || false}
      />
    );
  };

  return (
    <div className="question__answers--options">
      <div className="w-full">
        {questionType === "single" ? (
          <RadioGroup
            value={isCorrectValues.findIndex((val) => val === true).toString()}
            onValueChange={(val) => setCorrectSingle(parseInt(val))}
            className="flex flex-col gap-1"
          >
            {fields.map((field, i) => (
              <AnswerRow
                key={field.id}
                i={i}
                qIndex={qIndex}
                remove={remove}
                selector={renderSelector(i)}
              />
            ))}
          </RadioGroup>
        ) : (
          fields.map((field, i) => (
            <AnswerRow
              key={field.id}
              i={i}
              qIndex={qIndex}
              remove={remove}
              selector={renderSelector(i)}
            />
          ))
        )}
      </div>

      <AddAnswer
        onClick={() => append({ text: "", isCorrect: false, imageUrl: "" })}
      />

      <div className="question__tooltip text-muted-foreground text-xs mt-2">
        {questionType === "multiple"
          ? t("quizBuilder.answerHintMultiple")
          : t("quizBuilder.answerHintSingle")}
      </div>
    </div>
  );
};

const AnswerRow = ({
  i,
  qIndex,
  remove,
  selector,
}: {
  i: number;
  qIndex: number;
  remove: (index: number) => void;
  selector: React.ReactNode;
}) => {
  const { t } = useTranslation();
  return (
  <div className="flex items-center gap-2 mb-2">
    {selector}

    <Controller
      name={`questions.${qIndex}.answers.${i}.text`}
      render={({ field }) => (
        <FieldInput
          type="text"
          placeholder={t("quizBuilder.answerPlaceholder", { n: i + 1 })}
          className="lg:w-175"
          textChange={field.onChange}
          value={field.value}
        >
          <Option size={13} />
        </FieldInput>
      )}
    />

    <Controller
      name={`questions.${qIndex}.answers.${i}.imageUrl`}
      render={({ field }) => (
        <ImageUpload value={field.value} onChange={field.onChange} size="sm" />
      )}
    />

    <button
      type="button"
      className="ml-auto text-red-500 hover:opacity-80 transition-opacity"
      onClick={() => remove(i)}
    >
      <X size={14} />
    </button>
  </div>
  );
};
