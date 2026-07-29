import { Loader } from "@/widgets/Loader/Loader";
import { useQuizzes } from "./hooks/useGetQuizes";
import { PublishedCard } from "./components/PublishedCard";
import { useState } from "react";
import type { Quiz } from "./types";

export const TeacherQuizesPage = () => {
  const { data, isLoading } = useQuizzes();
  const [filtered, setFiltered] = useState<Quiz[] | undefined>(data);

  function filterQuizes(status: string) {
    if (status === "all") {
      setFiltered(data);
    }
    if (status === "draft") {
      setFiltered(data?.filter((item) => !item.published));
    }
    if (status === "published") {
      setFiltered(data?.filter((item) => item.published));
    }
  }

  if (isLoading) return <Loader />;
  return (
    <div className="quizes__page--wrapper p-5">
      <div className="quizes__counts--wrapper flex items-center p-4 gap-3">
        <div className="all_quizes--count p-4 text-sm border bg-(--main-blue) text-center rounded-md flex flex-col text-white">
          <span>Все тесты</span>
          <span>{data?.length}</span>
        </div>
        <div className="published_quizes--count p-4 text-sm border bg-(--success-green) text-center rounded-md flex flex-col text-white">
          <span>Активные</span>
          <span>{data?.filter((item) => item.published).length}</span>
        </div>
        <div className="published_quizes--count p-4 text-sm border bg-orange-400 text-center rounded-md flex flex-col text-white">
          <span>Черновики</span>
          <span>{data?.filter((item) => !item.published).length}</span>
        </div>
      </div>
      <div className="quizes__page--filters flex items-center p-4 text-xs gap-2">
        <button
          onClick={() => filterQuizes("all")}
          className="bg-zinc-400 text-muted px-3 py-1 rounded-xl"
        >
          Все
        </button>
        <button
          onClick={() => filterQuizes("published")}
          className="bg-zinc-400 text-muted px-3 py-1 rounded-xl"
        >
          Опубликованные
        </button>
        <button
          onClick={() => filterQuizes("draft")}
          className="bg-zinc-400 text-muted px-3 py-1 rounded-xl"
        >
          Черновики
        </button>
      </div>
      <div className="quizes__list grid grid-cols-3 gap-4">
        {filtered
          ? filtered.map((item) => <PublishedCard quiz={item} />)
          : data?.map((item) => <PublishedCard quiz={item} />)}
      </div>
    </div>
  );
};
