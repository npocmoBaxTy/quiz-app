import { Timer } from "./Timer";

export function QuestionTitle({ title }: { title: string }) {
  return (
    <div className="question__title--wrapper mb-5">
      <div className="flex justify-between gap-5 items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">{title}</h2>
        </div>
        <Timer />
      </div>
    </div>
  );
}
