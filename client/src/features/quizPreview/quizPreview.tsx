import { useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/app/components/ui/dialog";
import { useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Check, Clock, ListChecks, Target, Eye } from "lucide-react";
import type { QuizFormValues } from "@/features/quizCreate/lib/schema/index";
import type { Answer, Question } from "../quizCreate/types";
import { resolveMediaUrl } from "@/shared/api/resolveMediaUrl";

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

export const QuizPreview = ({ isOpen, onClose }: Props) => {
  const { t } = useTranslation();
  const { getValues } = useFormContext<QuizFormValues>();
  const title = getValues("title");
  const passing = getValues("passing");
  const timeLimit = getValues("timeLimit");
  const questionsLimit = getValues("questionsLimit");
  const questions = getValues("questions") || [];

  const [mockAnswers, setMockAnswers] = useState<Record<number, number[]>>({});

  const handleSelectMockAnswer = (
    qIndex: number,
    aIndex: number,
    type: string,
  ) => {
    setMockAnswers((prev) => {
      const current = prev[qIndex] || [];
      if (type === "single") {
        return { ...prev, [qIndex]: [aIndex] };
      } else {
        if (current.includes(aIndex)) {
          return { ...prev, [qIndex]: current.filter((i) => i !== aIndex) };
        } else {
          return { ...prev, [qIndex]: [...current, aIndex] };
        }
      }
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="z-100 max-h-[90vh] min-w-3xl overflow-y-auto rounded-3xl bg-(--main-bg) p-0 border-none">
        <DialogTitle className="sr-only">{t("quizBuilder.previewDialog.dialogTitle")}</DialogTitle>

        <div className="sticky top-0 z-10 border-b border-(--surface-high) bg-(--surface-main)/95 px-6 py-4 backdrop-blur">
          <div className="flex items-center gap-2 text-xs font-bold tracking-wide text-(--main-blue) uppercase">
            <Eye size={13} />
            {t("quizBuilder.previewDialog.badge")}
          </div>
          <h2 className="mt-1 truncate pr-10 text-xl font-bold text-(--text-main)">
            {title || t("quizBuilder.previewDialog.untitled")}
          </h2>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <SettingChip icon={<Clock size={13} />}>
              {timeLimit ? `${timeLimit} ${t("quizBuilder.previewDialog.minutes")}` : t("quizBuilder.previewDialog.noLimit")}
            </SettingChip>
            <SettingChip icon={<Target size={13} />}>
              {t("quizBuilder.previewDialog.passing")} {passing ?? 0}%
            </SettingChip>
            <SettingChip icon={<ListChecks size={13} />}>
              {questions.length}{" "}
              {questionsLimit && questionsLimit < questions.length
                ? t("quizBuilder.previewDialog.questionsCountLimited", { limit: questionsLimit })
                : t("quizBuilder.previewDialog.questionsCount")}
            </SettingChip>
          </div>
        </div>

        <div className="flex flex-col gap-4 p-6">
          {questions.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-(--surface-high) bg-(--surface-main) py-10 text-center text-sm text-(--text-muted)">
              {t("quizBuilder.previewDialog.noQuestions")}
            </div>
          ) : (
            questions.map((question: Question, qIndex: number) => (
              <div
                key={qIndex}
                className="rounded-2xl border border-(--surface-high) bg-(--surface-main) p-5"
              >
                <div className="mb-4 flex items-start justify-between gap-4">
                  <h3 className="text-base font-bold text-(--text-main)">
                    <span className="mr-2 text-(--main-blue)">{qIndex + 1}.</span>
                    {question.text || (
                      <span className="font-normal text-(--text-muted) italic">
                        {t("quizBuilder.previewDialog.emptyQuestion")}
                      </span>
                    )}
                  </h3>
                  <span className="shrink-0 rounded-full bg-(--main-bg) px-2.5 py-1 text-xs font-bold text-(--text-muted)">
                    {question.points} {question.points === 1 ? t("quizBuilder.previewDialog.point") : t("quizBuilder.previewDialog.points")}
                  </span>
                </div>

                {question.imageUrl && (
                  <img
                    src={resolveMediaUrl(question.imageUrl)}
                    alt=""
                    className="mb-4 max-h-64 w-full rounded-xl border border-(--surface-high) object-contain"
                  />
                )}

                <div className="flex flex-col gap-2.5">
                  {question.type === "text" && (
                    <textarea
                      disabled
                      placeholder={t("quizBuilder.previewDialog.studentAnswerPlaceholder")}
                      className="w-full resize-none rounded-xl border border-(--surface-high) bg-(--main-bg) p-3 text-sm outline-none"
                      rows={3}
                    />
                  )}

                  {(question.type === "single" ||
                    question.type === "multiple") &&
                    question.answers?.map((answer: Answer, aIndex: number) => {
                      const isSelected = mockAnswers[qIndex]?.includes(aIndex);
                      const isCorrect = answer.isCorrect;

                      return (
                        <button
                          type="button"
                          key={aIndex}
                          onClick={() =>
                            handleSelectMockAnswer(
                              qIndex,
                              aIndex,
                              question.type,
                            )
                          }
                          className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left transition-all ${
                            isSelected
                              ? "border-(--main-blue) bg-(--hover-bg)"
                              : isCorrect
                                ? "border-(--success-green)/30 bg-(--success-green)/5"
                                : "border-(--surface-high) hover:border-(--main-blue)/40 hover:bg-(--hover-bg)"
                          }`}
                        >
                          <span
                            className={`flex h-5 w-5 shrink-0 items-center justify-center border-2 ${
                              question.type === "single" ? "rounded-full" : "rounded-md"
                            } ${
                              isSelected
                                ? "border-(--main-blue) bg-(--main-blue) text-white"
                                : "border-(--surface-high)"
                            }`}
                          >
                            {isSelected && <Check size={13} strokeWidth={3} />}
                          </span>

                          {answer.imageUrl && (
                            <img
                              src={resolveMediaUrl(answer.imageUrl)}
                              alt=""
                              className="h-12 w-12 shrink-0 rounded-md border border-(--surface-high) object-cover"
                            />
                          )}

                          <span className="flex-1 text-sm text-(--text-main)">
                            {answer.text || (
                              <span className="text-(--text-muted) italic">
                                {t("quizBuilder.previewDialog.emptyAnswer")}
                              </span>
                            )}
                          </span>

                          {isCorrect && (
                            <span className="flex shrink-0 items-center gap-1 rounded-full bg-(--success-green)/10 px-2 py-0.5 text-[11px] font-bold text-(--success-green)">
                              <Check size={11} strokeWidth={3} />
                              {t("quizBuilder.previewDialog.correct")}
                            </span>
                          )}
                        </button>
                      );
                    })}
                </div>
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

function SettingChip({
  icon,
  children,
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <span className="flex items-center gap-1.5 rounded-full bg-(--main-bg) px-3 py-1 text-xs font-semibold text-(--text-muted)">
      {icon}
      {children}
    </span>
  );
}
