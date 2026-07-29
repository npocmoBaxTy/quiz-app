import { useTestStore } from "@/pages/QuizTaking/store/store";

type Props = {
  questionId: string;
};

export function FreeTypeAnswer({ questionId }: Props) {
  const value = useTestStore((s) => s.answers[questionId]?.[0] || "");

  const setText = useTestStore((s) => s.setTextAnswer);

  return (
    <div className="relative">
      <textarea
        value={value}
        onChange={(e) => setText(questionId, e.target.value)}
        className="w-full p-2 border rounded-md resize-none border-slate-300 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        placeholder="Введите ответ..."
        rows={4}
        maxLength={500}
      />
      <span className="absolute bottom-3 right-2 text-xs text-slate-400">
        {value.length}/500
      </span>
    </div>
  );
}
