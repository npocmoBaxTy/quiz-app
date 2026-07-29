import { useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/app/components/ui/dialog";
import { useFormContext } from "react-hook-form";
import { Check } from "lucide-react"; // Иконки для чекбоксов/радио
import type { QuizFormValues } from "@/features/quizCreate/lib/schema/index"; // Подключите ваш тип!
import type { Answer, Question } from "../quizCreate/types";

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

export const QuizPreview = ({ isOpen, onClose }: Props) => {
  const { getValues } = useFormContext<QuizFormValues>();
  const title = getValues("title");
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
      <DialogContent className="z-100 max-h-[90vh] min-w-3xl overflow-y-auto bg-slate-50 p-0 border-none">
        <DialogTitle className="sr-only">Предпросмотр теста</DialogTitle>
        <div className="sticky top-0 bg-white border-b z-10 px-6 py-4 shadow-sm flex justify-between items-center">
          <h2 className="text-xl font-bold text-slate-800 truncate pr-4">
            {title || "Без названия"}
          </h2>
        </div>

        <div className="p-6 flex flex-col gap-8">
          {questions.length === 0 ? (
            <div className="text-center text-zinc-400 py-10">
              В тесте пока нет вопросов.
            </div>
          ) : (
            questions.map((question: Question, qIndex: number) => (
              <div
                key={qIndex}
                className="bg-white p-6 rounded-xl border shadow-sm"
              >
                {/* Текст вопроса и баллы */}
                <div className="flex justify-between items-start gap-4 mb-4">
                  <h3 className="text-lg font-medium text-slate-800">
                    <span className="text-blue-500 mr-2">{qIndex + 1}.</span>
                    {question.text || (
                      <span className="italic text-zinc-400">
                        Пустой вопрос
                      </span>
                    )}
                  </h3>
                  <span className="text-sm font-semibold text-zinc-400 bg-zinc-100 px-2 py-1 rounded shrink-0">
                    {question.points} {question.points === 1 ? "балл" : "балла"}
                  </span>
                </div>

                <div className="flex flex-col gap-3">
                  {question.type === "text" && (
                    <textarea
                      disabled
                      placeholder="Студент введет свой ответ здесь..."
                      className="w-full p-3 rounded-lg border border-zinc-200 bg-zinc-50 resize-none outline-none"
                      rows={3}
                    />
                  )}

                  {(question.type === "single" ||
                    question.type === "multiple") &&
                    question.answers?.map((answer: Answer, aIndex: number) => {
                      const isSelected = mockAnswers[qIndex]?.includes(aIndex);

                      return (
                        <div
                          key={aIndex}
                          onClick={() =>
                            handleSelectMockAnswer(
                              qIndex,
                              aIndex,
                              question.type,
                            )
                          }
                          className={`p-3 rounded-lg border cursor-pointer flex items-center gap-3 transition-all ${
                            isSelected
                              ? "border-blue-500 bg-blue-50"
                              : "border-zinc-200 hover:border-blue-300 hover:bg-zinc-50"
                          }`}
                        >
                          {/* Иконка чекбокса/радио (кастомная для красоты) */}
                          <div
                            className={`w-5 h-5 rounded flex items-center justify-center shrink-0 ${
                              question.type === "single"
                                ? "rounded-full"
                                : "rounded-md"
                            } ${isSelected ? "bg-blue-500 text-white" : "border-2 border-zinc-300"}`}
                          >
                            {isSelected && <Check size={14} strokeWidth={3} />}
                          </div>

                          <span className="text-slate-700 text-sm">
                            {answer.text || (
                              <span className="italic text-zinc-400">
                                Пустой ответ
                              </span>
                            )}
                          </span>
                        </div>
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
