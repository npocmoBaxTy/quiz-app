import { useState } from "react";
import { NavLink } from "react-router-dom";
import { Plus, BookOpen, Loader2, AlertCircle } from "lucide-react";

// Импортируем наши новые компоненты
import { QuizzesToolbar } from "./QuizesToolbar";
import { QuizCard } from "./QuizesCard";
import type { Quiz } from "../../types";
import { useQuizzes } from "@/pages/TeacherQuizesPage/hooks/useGetQuizes";

export function TeacherQuizzesTab() {
  const { data: quizzes, isLoading, isError } = useQuizzes();

  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "published" | "drafts">("all");

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-400">
        <Loader2 className="animate-spin mb-4" size={32} />
        <p>Загрузка тестов...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-red-500 bg-red-50 rounded-2xl border border-red-100">
        <AlertCircle className="mb-4" size={32} />
        <p className="font-medium text-lg">Не удалось загрузить тесты</p>
      </div>
    );
  }

  const filteredQuizzes =
    quizzes?.filter((quiz: Quiz) => {
      const matchesSearch = quiz.title
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchesFilter =
        filter === "all"
          ? true
          : filter === "published"
            ? quiz.published
            : !quiz.published;

      return matchesSearch && matchesFilter;
    }) || [];

  return (
    <div className="flex max-w-312 flex-col h-full animate-in fade-in duration-300 p-5">
      {/* Шапка */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Мои тесты</h2>
          <p className="text-slate-500 mt-1">
            Управление материалами и просмотр статистики.
          </p>
        </div>
        <NavLink
          to="/teacher/create-quiz"
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium shadow-sm transition-all active:scale-95 shrink-0"
        >
          <Plus size={18} />
          Создать тест
        </NavLink>
      </div>

      {/* Панель инструментов */}
      <QuizzesToolbar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        filter={filter}
        setFilter={setFilter}
      />

      {/* Сетка карточек или пустое состояние */}
      {filteredQuizzes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 bg-white border border-slate-200 rounded-2xl border-dashed">
          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
            <BookOpen size={32} className="text-slate-300" />
          </div>
          <h3 className="text-lg font-bold text-slate-700 mb-1">
            Ничего не найдено
          </h3>
          <p className="text-slate-500 text-sm text-center max-w-sm">
            У вас пока нет тестов в этой категории, либо поиск не дал
            результатов.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredQuizzes.map((quiz: Quiz) => (
            <QuizCard key={quiz.id} quiz={quiz} />
          ))}
        </div>
      )}
    </div>
  );
}
