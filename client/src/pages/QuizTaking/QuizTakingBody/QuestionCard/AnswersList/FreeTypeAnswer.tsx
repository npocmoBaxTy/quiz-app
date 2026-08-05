import { useTestStore } from "@/pages/QuizTaking/store/store";
import { useTranslation } from "react-i18next";

type Props = {
  questionId: string;
};

export function FreeTypeAnswer({ questionId }: Props) {
  const value = useTestStore((s) => s.answers[questionId]?.[0] || "");

  const setText = useTestStore((s) => s.setTextAnswer);
  const { t } = useTranslation();

  return (
    <div className="relative">
      <textarea
        value={value}
        onChange={(e) => setText(questionId, e.target.value)}
        className="w-full h-48 p-5 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all resize-y text-slate-700 placeholder:text-slate-400 text-[15px]"
        placeholder={t("quizTaking.freeAnswerPlaceholder")}
        maxLength={500}
      />
      <span className="absolute bottom-3 right-4 text-xs font-medium text-slate-400">
        {value.length}/500
      </span>
    </div>
  );
}
