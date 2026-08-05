import { useTestStore } from "../../store/store";
import { resolveMediaUrl } from "@/shared/api/resolveMediaUrl";

export function QuestionText() {
  const questions = useTestStore((s) => s.questions);
  const qIndex = useTestStore((s) => s.currentIndex);
  const question = questions[qIndex];

  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
      <h2 className="text-xl sm:text-2xl font-bold text-slate-800 leading-snug break-all mb-5">
        {question?.text}
      </h2>

      {question?.imageUrl && (
        <div className="mb-6 rounded-2xl overflow-hidden border border-slate-200 shadow-sm bg-slate-50">
          <img
            src={resolveMediaUrl(question.imageUrl)}
            alt=""
            className="w-full max-h-[400px] object-contain"
          />
        </div>
      )}
    </div>
  );
}
