import { Flag } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useTestStore } from "../store/store";

interface Props {
  onFinishClick: () => void;
}

export function QuestionNavigator({ onFinishClick }: Props) {
  const { t } = useTranslation();
  const questions = useTestStore((s) => s.questions);
  const answers = useTestStore((s) => s.answers);
  const flagged = useTestStore((s) => s.flagged);
  const currentIndex = useTestStore((s) => s.currentIndex);
  const goToIndex = useTestStore((s) => s.goToIndex);
  const answeredCount = useTestStore((s) => s.getAnsweredCount());

  return (
    <aside className="w-full lg:w-80 shrink-0 flex flex-col gap-6">
      <div className="bg-white p-6 rounded-[24px] border border-slate-200 shadow-sm lg:sticky lg:top-28">
        <h3 className="font-bold text-slate-800 mb-4 flex items-center justify-between">
          {t("quizTaking.navigator.title")}
          <span className="text-xs font-medium bg-slate-100 text-slate-500 px-2 py-1 rounded-md">
            {answeredCount}/{questions.length}
          </span>
        </h3>

        {/* Сетка квадратиков */}
        <div className="grid grid-cols-5 gap-2 sm:gap-3">
          {questions.map((q, idx) => {
            const isCurrent = idx === currentIndex;
            const isAnswered = !!answers[q.id]?.length;
            const isFlagged = !!flagged[q.id];

            let btnClasses =
              "border-slate-200 text-slate-600 hover:border-indigo-300 hover:bg-indigo-50";

            if (isCurrent) {
              btnClasses =
                "border-indigo-600 bg-indigo-600 text-white shadow-md shadow-indigo-200 ring-2 ring-indigo-200 ring-offset-2";
            } else if (isAnswered) {
              btnClasses = "border-emerald-500 bg-emerald-50 text-emerald-700";
            }

            return (
              <button
                key={q.id}
                type="button"
                onClick={() => goToIndex(idx)}
                className={`relative w-full aspect-square rounded-xl border-2 flex items-center justify-center font-bold text-sm sm:text-base transition-all duration-200 ${btnClasses}`}
              >
                {idx + 1}

                {isFlagged && (
                  <div
                    className={`absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full flex items-center justify-center shadow-sm ${
                      isCurrent ? "bg-white text-indigo-600" : "bg-amber-100 border border-amber-300 text-amber-600"
                    }`}
                  >
                    <Flag size={10} fill="currentColor" />
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Легенда */}
        <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col gap-3 text-sm text-slate-600 font-medium">
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 rounded-md border-2 border-emerald-500 bg-emerald-50"></div>
            {t("quizTaking.navigator.answered")}
          </div>
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 rounded-md border-2 border-slate-200 bg-white"></div>
            {t("quizTaking.navigator.notAnswered")}
          </div>
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 rounded-full bg-amber-100 flex items-center justify-center border border-amber-300 text-amber-600">
              <Flag size={10} fill="currentColor" />
            </div>
            {t("quizTaking.navigator.marked")}
          </div>
        </div>

        {/* Мобильная кнопка завершения */}
        <button
          onClick={onFinishClick}
          className="w-full mt-8 sm:hidden flex justify-center items-center gap-2 bg-slate-900 text-white px-5 py-3.5 rounded-xl font-bold active:scale-95"
        >
          {t("quizTaking.footer.finishTest")}
        </button>
      </div>
    </aside>
  );
}
