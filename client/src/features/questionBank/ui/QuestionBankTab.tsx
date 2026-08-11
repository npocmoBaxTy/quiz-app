import { useEffect, useMemo, useState } from "react";
import { useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Library, Search } from "lucide-react";
import toast from "react-hot-toast";

import { Spinner } from "@/shared/ui/SPinner/Spinner";
import type { QuizFormValues } from "@/features/quizCreate/types";

import { useQuestionBank } from "../api/getQuestionBank";
import { BankQuestionCard } from "./BankQuestionCard";
import type { BankQuestion } from "../types";

const PAGE_SIZE = 20;

type Props = {
  /** id редактируемого теста — его собственные вопросы в банке не показываем */
  currentQuizId?: string;
  /** переключение на вкладку с вопросами после добавления */
  onAdded?: () => void;
};

// Вопрос банка -> вопрос формы. id намеренно не переносим: бэкенд всё равно
// создаёт новые записи в questions, а чужой questionId сломал бы связь
// со старыми попытками.
const toFormQuestion = (q: BankQuestion) => ({
  text: q.text,
  type: q.type,
  points: q.points || 1,
  imageUrl: q.imageUrl || undefined,
  answers:
    q.type === "text"
      ? []
      : q.answers.map((a) => ({
          text: a.text,
          isCorrect: a.isCorrect,
          imageUrl: a.imageUrl || undefined,
        })),
});

export const QuestionBankTab = ({ currentQuizId, onAdded }: Props) => {
  const { t } = useTranslation();
  const { getValues, setValue } = useFormContext<QuizFormValues>();

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [type, setType] = useState("");
  const [quizId, setQuizId] = useState("");
  const [pages, setPages] = useState(1);
  const [selected, setSelected] = useState<string[]>([]);

  // Дебаунс поиска, чтобы не дёргать сервер на каждый символ
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput.trim());
      setPages(1);
    }, 350);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const { data, isLoading, isError, isFetching } = useQuestionBank({
    search: search || undefined,
    type: type || undefined,
    quizId: quizId || undefined,
    excludeQuizId: currentQuizId || undefined,
    limit: PAGE_SIZE * pages,
    offset: 0,
  });

  const items = useMemo(() => data?.items ?? [], [data]);
  const total = data?.total ?? 0;
  const hasMore = items.length < total;

  const addQuestions = (questions: BankQuestion[]) => {
    if (questions.length === 0) return;

    const current = getValues("questions") ?? [];
    setValue("questions", [...current, ...questions.map(toFormQuestion)], {
      shouldDirty: true,
      shouldValidate: true,
    });

    toast.success(t("quizBuilder.bank.added", { count: questions.length }));
    setSelected([]);
    onAdded?.();
  };

  const toggle = (id: string) =>
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id],
    );

  const allShownSelected =
    items.length > 0 && items.every((q) => selected.includes(q.id));

  return (
    <div className="question__bank--tab p-4 bg-white min-h-125 flex flex-col gap-4">
      {/* Фильтры */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-60">
          <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
          />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            // Вкладка живёт внутри <form> без onSubmit — Enter иначе
            // перезагрузил бы страницу и потерял черновик.
            onKeyDown={(e) => {
              if (e.key === "Enter") e.preventDefault();
            }}
            placeholder={t("quizBuilder.bank.searchPlaceholder")}
            className="w-full text-sm pl-9 pr-3 py-2 rounded-lg border border-zinc-200 outline-none focus:border-(--main-blue)"
          />
        </div>

        <select
          value={type}
          onChange={(e) => {
            setType(e.target.value);
            setPages(1);
          }}
          className="text-sm py-2 px-3 rounded-lg border border-zinc-200 outline-none focus:border-(--main-blue) cursor-pointer"
        >
          <option value="">{t("quizBuilder.bank.allTypes")}</option>
          <option value="single">{t("quizBuilder.bank.type.single")}</option>
          <option value="multiple">{t("quizBuilder.bank.type.multiple")}</option>
        </select>

        <select
          value={quizId}
          onChange={(e) => {
            setQuizId(e.target.value);
            setPages(1);
          }}
          className="text-sm py-2 px-3 rounded-lg border border-zinc-200 outline-none focus:border-(--main-blue) cursor-pointer max-w-60"
        >
          <option value="">{t("quizBuilder.bank.allQuizzes")}</option>
          {(data?.quizzes ?? []).map((quiz) => (
            <option key={quiz.id} value={quiz.id}>
              {quiz.title} ({quiz.count})
            </option>
          ))}
        </select>
      </div>

      {/* Панель массовых действий */}
      <div className="flex items-center justify-between gap-2 text-xs text-zinc-500">
        <div className="flex items-center gap-3">
          <span>{t("quizBuilder.bank.found", { count: total })}</span>
          {items.length > 0 && (
            <button
              type="button"
              onClick={() =>
                setSelected(allShownSelected ? [] : items.map((q) => q.id))
              }
              className="text-(--main-blue) hover:underline cursor-pointer"
            >
              {allShownSelected
                ? t("quizBuilder.bank.clearSelection")
                : t("quizBuilder.bank.selectAll")}
            </button>
          )}
        </div>

        <button
          type="button"
          disabled={selected.length === 0}
          onClick={() =>
            addQuestions(items.filter((q) => selected.includes(q.id)))
          }
          className={`text-xs px-3 py-1.5 rounded-md transition-colors ${
            selected.length === 0
              ? "bg-zinc-100 text-zinc-400 cursor-not-allowed"
              : "bg-blue-100 text-blue-600 hover:bg-blue-200 cursor-pointer"
          }`}
        >
          {t("quizBuilder.bank.addSelected", { count: selected.length })}
        </button>
      </div>

      {/* Список */}
      {isLoading ? (
        <div className="flex-1 flex items-center justify-center">
          <Spinner />
        </div>
      ) : isError ? (
        <div className="flex-1 flex items-center justify-center text-sm text-red-500">
          {t("quizBuilder.bank.loadError")}
        </div>
      ) : items.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-2 border-2 border-dashed rounded-lg text-zinc-400 py-16">
          <Library size={32} />
          <span className="text-sm">
            {search || type || quizId
              ? t("quizBuilder.bank.emptyFiltered")
              : t("quizBuilder.bank.empty")}
          </span>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {items.map((question) => (
            <BankQuestionCard
              key={question.id}
              question={question}
              isSelected={selected.includes(question.id)}
              onToggle={() => toggle(question.id)}
              onAdd={() => addQuestions([question])}
            />
          ))}

          {hasMore && (
            <button
              type="button"
              disabled={isFetching}
              onClick={() => setPages((p) => p + 1)}
              className="self-center mt-2 text-xs px-4 py-2 rounded-md border border-zinc-200 text-zinc-600 hover:bg-zinc-50 cursor-pointer disabled:opacity-50"
            >
              {isFetching
                ? t("quizBuilder.bank.loading")
                : t("quizBuilder.bank.loadMore")}
            </button>
          )}
        </div>
      )}
    </div>
  );
};
