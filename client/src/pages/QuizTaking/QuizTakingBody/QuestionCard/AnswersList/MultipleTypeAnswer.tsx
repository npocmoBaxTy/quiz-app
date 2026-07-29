import { useTestStore } from "@/pages/QuizTaking/store/store";
import { useShallow } from "zustand/shallow";

type Props = {
  questionId: string;
  options: { id: string; text: string }[];
};

export function MultipleTypeAnswer({ questionId, options }: Props) {
  const selected = useTestStore(useShallow((s) => s.answers[questionId] || []));

  const toggle = useTestStore((s) => s.toggleMultipleAnswer);

  return (
    <div>
      {options.map((opt) => {
        const checked = selected.includes(opt.id);

        return (
          <label
            key={opt.id}
            className={`flex items-center gap-3 p-4 mb-2 border rounded-md cursor-pointer
              ${checked ? "border-blue-500 bg-blue-50" : ""}`}
          >
            <input
              type="checkbox"
              checked={checked}
              onChange={() => toggle(questionId, opt.id)}
            />

            <span className="break-all">{opt.text}</span>
          </label>
        );
      })}
    </div>
  );
}
