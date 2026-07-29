import { RadioGroup, RadioGroupItem } from "@/app/components/ui/radio-group";
import { useTestStore } from "@/pages/QuizTaking/store/store";

type Props = {
  questionId: string;
  options: { id: string; text: string }[];
};

export function SingleTypeAnswer({ questionId, options }: Props) {
  const selected = useTestStore((s) => s.answers[questionId]?.[0]);

  const setAnswer = useTestStore((s) => s.setSingleAnswer);

  return (
    <RadioGroup
      value={selected}
      onValueChange={(val) => setAnswer(questionId, val)}
    >
      {options.map((opt) => (
        <label
          key={opt.id}
          className={`flex items-center gap-3 p-4 mb-2 border rounded-md cursor-pointer
            ${selected === opt.id ? "border-blue-500 bg-blue-50" : ""}`}
        >
          <RadioGroupItem value={opt.id} />
          <span className="break-all">{opt.text}</span>
        </label>
      ))}
    </RadioGroup>
  );
}
