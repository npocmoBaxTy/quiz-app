import { memo, useState } from "react";
import { Check, ChevronDown, ChevronUp, Plus } from "lucide-react";
import { useTranslation } from "react-i18next";

import { resolveMediaUrl } from "@/shared/api/resolveMediaUrl";
import type { BankQuestion } from "../types";

type Props = {
  question: BankQuestion;
  isSelected: boolean;
  onToggle: () => void;
  onAdd: () => void;
};

export const BankQuestionCard = memo(
  ({ question, isSelected, onToggle, onAdd }: Props) => {
    const { t } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);

    const correctCount = question.answers.filter((a) => a.isCorrect).length;

    return (
      <div
        className={`rounded-lg border transition-all bg-white ${
          isSelected
            ? "border-blue-500 shadow-sm"
            : "border-zinc-200 hover:border-blue-300"
        }`}
      >
        <div className="flex items-start gap-3 p-3">
          <button
            type="button"
            onClick={onToggle}
            aria-pressed={isSelected}
            className={`mt-0.5 shrink-0 w-5 h-5 rounded border flex items-center justify-center cursor-pointer transition-colors ${
              isSelected
                ? "bg-(--main-blue) border-(--main-blue) text-white"
                : "border-zinc-300 hover:border-(--main-blue)"
            }`}
          >
            {isSelected && <Check size={14} />}
          </button>

          <div className="min-w-0 flex-1">
            <p className="text-sm text-zinc-800 break-words">{question.text}</p>

            <div className="flex flex-wrap items-center gap-1.5 mt-2 text-xs">
              <span className="px-1.5 py-0.5 rounded bg-[#fff3e6] text-(--main-blue)">
                {t(`quizBuilder.bank.type.${question.type}`)}
              </span>
              <span className="px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-600">
                {t("quizBuilder.bank.points", { count: question.points })}
              </span>
              {question.type !== "text" && (
                <span className="px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-600">
                  {t("quizBuilder.bank.answersCount", {
                    count: question.answers.length,
                  })}
                </span>
              )}
              {question.sources.map((source) => (
                <span
                  key={source.id}
                  className="px-1.5 py-0.5 rounded bg-zinc-50 border border-zinc-200 text-zinc-500 max-w-50 truncate"
                  title={source.title}
                >
                  {source.title}
                </span>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            {question.type !== "text" && (
              <button
                type="button"
                onClick={() => setIsOpen((v) => !v)}
                className="text-zinc-400 hover:text-zinc-700 p-1 cursor-pointer"
                title={t("quizBuilder.bank.togglePreview")}
              >
                {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
            )}
            <button
              type="button"
              onClick={onAdd}
              className="flex items-center gap-1 text-xs px-2 py-1 rounded-md bg-blue-100 text-blue-600 hover:bg-blue-200 cursor-pointer transition-colors"
            >
              <Plus size={13} />
              {t("quizBuilder.bank.add")}
            </button>
          </div>
        </div>

        {isOpen && question.type !== "text" && (
          <div className="border-t border-zinc-100 p-3 pt-2 flex flex-col gap-1.5">
            {question.imageUrl && (
              <img
                src={resolveMediaUrl(question.imageUrl)}
                alt=""
                className="max-h-40 w-auto rounded-md object-contain mb-1"
              />
            )}
            {question.answers.map((answer, i) => (
              <div
                key={i}
                className={`text-xs flex items-center gap-2 px-2 py-1 rounded ${
                  answer.isCorrect
                    ? "bg-green-50 text-green-700"
                    : "bg-zinc-50 text-zinc-600"
                }`}
              >
                {answer.isCorrect ? (
                  <Check size={13} className="shrink-0" />
                ) : (
                  <span className="w-3 shrink-0" />
                )}
                <span className="break-words">
                  {answer.text || t("quizBuilder.bank.imageOnlyAnswer")}
                </span>
              </div>
            ))}
            {correctCount === 0 && (
              <span className="text-xs text-red-500">
                {t("quizBuilder.bank.noCorrectAnswer")}
              </span>
            )}
          </div>
        )}
      </div>
    );
  },
);

BankQuestionCard.displayName = "BankQuestionCard";
