import { CheckCircle2 } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/app/components/ui/radio-group";
import { useTestStore } from "@/pages/QuizTaking/store/store";
import { resolveMediaUrl } from "@/shared/api/resolveMediaUrl";

type Props = {
  questionId: string;
  options: { id: string; text: string; imageUrl?: string | null }[];
};

export function SingleTypeAnswer({ questionId, options }: Props) {
  const selected = useTestStore((s) => s.answers[questionId]?.[0]);
  const setAnswer = useTestStore((s) => s.setSingleAnswer);
  const hasImages = options.some((opt) => !!opt.imageUrl);

  return (
    <RadioGroup
      value={selected}
      onValueChange={(val) => setAnswer(questionId, val)}
      className={hasImages ? "grid grid-cols-1 sm:grid-cols-2 gap-4" : "gap-2.5"}
    >
      {options.map((opt) => {
        const isSelected = selected === opt.id;

        if (hasImages) {
          return (
            <label
              key={opt.id}
              className={`group relative flex flex-col rounded-2xl border-2 cursor-pointer transition-all duration-200 overflow-hidden ${
                isSelected ? "border-indigo-600 bg-indigo-50/30" : "border-slate-200 bg-white hover:border-slate-300"
              }`}
            >
              <RadioGroupItem value={opt.id} className="sr-only" />
              {opt.imageUrl && (
                <div className="w-full h-40 sm:h-48 relative overflow-hidden">
                  <img
                    src={resolveMediaUrl(opt.imageUrl)}
                    alt=""
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div
                    className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-md border shadow-sm transition-all ${
                      isSelected ? "bg-indigo-600 text-white border-indigo-600" : "bg-white/70 text-transparent border-white/50"
                    }`}
                  >
                    <CheckCircle2 size={20} className={isSelected ? "block" : "hidden"} />
                  </div>
                </div>
              )}
              <span className={`p-3 font-medium text-[15px] leading-snug break-all ${isSelected ? "text-indigo-950" : "text-slate-700"}`}>
                {opt.text}
              </span>
            </label>
          );
        }

        return (
          <label
            key={opt.id}
            className={`flex items-center gap-3 px-4 py-3.5 border rounded-xl cursor-pointer transition-colors font-medium text-[15px] leading-relaxed ${
              isSelected
                ? "border-indigo-300 bg-indigo-50 shadow-sm"
                : "border-slate-200 hover:border-indigo-200 hover:bg-slate-50"
            }`}
          >
            <RadioGroupItem value={opt.id} className="sr-only" />
            <span
              className={`shrink-0 w-6 h-6 rounded-full flex items-center justify-center border-2 transition-colors ${
                isSelected ? "border-indigo-600 bg-indigo-600 text-white" : "border-slate-300 text-transparent"
              }`}
            >
              <CheckCircle2 size={16} strokeWidth={3} />
            </span>
            <span className={`break-all ${isSelected ? "text-indigo-900" : "text-slate-700"}`}>
              {opt.text}
            </span>
          </label>
        );
      })}
    </RadioGroup>
  );
}
