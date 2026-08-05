import { FieldInput } from "@/features/auth/ui/FieldInput";
import { QuizDropdown } from "./QuizDropdown";
import { Baseline, MoveDown } from "lucide-react";
import { C } from "@/features/auth/constants";
import { Controller, useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";
import {
  CollapsibleContent,
  Collapsible,
  CollapsibleTrigger,
} from "@/app/components/ui/collapsible";

export const QuizConfiger = () => {
  const { setValue, watch } = useFormContext();
  const { t } = useTranslation();

  return (
    <div className="quiz__configer--wrapper p-3 bg-white rounded-xl mt-5">
      <Collapsible defaultOpen={true}>
        <div className="quiz__configer--title mb-5 font-semibold flex items-center">
          <p>{t("quizBuilder.settingsTitle")}</p>
          <CollapsibleTrigger className="ml-auto">
            <span>
              <MoveDown size={17} />
            </span>
          </CollapsibleTrigger>
        </div>
        <CollapsibleContent>
          <div className="quiz__configer--time">
            <div className="quiz__name w-full mb-5">
              <Controller
                name="title"
                render={({ field, fieldState }) => (
                  <FieldInput
                    type="text"
                    label={t("quizBuilder.quizNameLabel")}
                    placeholder={t("quizBuilder.quizNamePlaceholder")}
                    value={field.value}
                    textChange={field.onChange}
                    err={!!fieldState.error}
                  >
                    <Baseline size={15} />
                  </FieldInput>
                )}
              />
            </div>

            <div className="flex gap-4 items-center">
              <div className="quiz__time w-1/3">
                <QuizDropdown
                  onSelect={(v) =>
                    setValue("timeLimit", Number(v), { shouldDirty: true })
                  }
                  label={t("quizBuilder.timeLimitLabel")}
                  value={watch("timeLimit")}
                  items={["20", "30", "50", "60"]}
                />
              </div>

              <div className="quiz__passing w-1/3">
                <QuizDropdown
                  onSelect={(v) =>
                    setValue("passing", Number(v), { shouldDirty: true })
                  }
                  value={watch("passing")}
                  label={t("quizBuilder.passingScoreLabel")}
                  items={["20", "30", "50", "60"]}
                />
              </div>

              {/* 🔥 Новый блок для лимита вопросов вместо чекбокса перемешивания */}
              <div className="quiz__questions-limit w-1/3">
                <Controller
                  name="questionsLimit"
                  rules={{ required: true, min: 1 }}
                  render={({ field, fieldState }) => (
                    <div className="flex flex-col">
                      <h1
                        className="text-[10px] sm:text-xs font-semibold mb-2 uppercase"
                        style={{ color: C.muted }}
                      >
                        {t("quizBuilder.questionsInQuizLabel")}
                      </h1>
                      <input
                        type="number"
                        min="1"
                        required
                        value={field.value || ""}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value ? Number(e.target.value) : "",
                          )
                        }
                        className={`w-full border p-2 rounded-md outline-none transition-colors ${
                          fieldState.error
                            ? "border-red-500"
                            : "border-slate-200 focus:border-indigo-500"
                        }`}
                        placeholder={t("quizBuilder.questionsInQuizPlaceholder")}
                      />
                    </div>
                  )}
                />
              </div>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};
