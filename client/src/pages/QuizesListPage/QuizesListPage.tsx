import { useState, useMemo } from "react";
import { Sidebar } from "@/app/components/ui/sidebar";
import { ListCollapse, Search, BookOpen, CheckCircle2 } from "lucide-react";
import { QuizesList } from "./QuizesList/QuizesList";
import { useTranslation } from "react-i18next";
import { useStudentQuizzesList } from "./hooks/useGetQuizzesList";
import { ResultsList } from "./ResultsList/ResultsList";
import { useStudentResultsList } from "./ResultsList/api";
import { Pagination } from "@/shared/ui/Pagination/Pagination";

export const QuizesPAge = () => {
  const { t } = useTranslation();

  const [activeTab, setActiveTab] = useState<"available" | "completed">(
    "available",
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Получаем данные из хуков
  const { data: availableQuizzes } = useStudentQuizzesList();
  const { data: resultsResponse } = useStudentResultsList(currentPage);

  // Локальная фильтрация доступных тестов по строке поиска
  const filteredAvailableQuizzes = useMemo(() => {
    if (!availableQuizzes) return [];
    if (!searchQuery.trim()) return availableQuizzes;

    return availableQuizzes.filter((quiz) =>
      quiz.title.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [availableQuizzes, searchQuery]);

  // Обработчик переключения табов (сбрасываем поиск и пагинацию)
  const handleTabChange = (tab: "available" | "completed") => {
    setActiveTab(tab);
    setSearchQuery("");
    if (tab === "available") {
      setCurrentPage(1);
    }
  };

  return (
    <div className="quzes__list--wrapper min-h-screen relative bg-slate-50/50">
      <div className="flex">
        <Sidebar />

        <main className="grow lg:ml-60 md:p-8 md:pt-4">
          <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-6 mb-8 p-2">
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-2">
                {t("quizesPage.title", "Мои тесты")}
              </h1>
              <p className="text-slate-500">
                {activeTab === "available"
                  ? t(
                      "quizesPage.subtitleAvailable",
                      "У вас есть невыполненные тесты",
                    )
                  : t(
                      "quizesPage.subtitleCompleted",
                      "История прохождения и ваши оценки",
                    )}
              </p>
            </div>

            {/* ТАБЫ */}
            <div className="flex bg-slate-100 p-1 rounded-xl w-full sm:w-auto">
              <button
                onClick={() => handleTabChange("available")}
                className={`flex-1 sm:w-40 flex items-center justify-center gap-2 py-2.5 text-sm font-medium rounded-lg transition-all ${
                  activeTab === "available"
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                <BookOpen size={16} />
                {t("quizesPage.tabAvailable", "Доступные")}
              </button>
              <button
                onClick={() => handleTabChange("completed")}
                className={`flex-1 sm:w-40 flex items-center justify-center gap-2 py-2.5 text-sm font-medium rounded-lg transition-all ${
                  activeTab === "completed"
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                <CheckCircle2 size={16} />
                {t("quizesPage.tabCompleted", "Завершенные")}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 mb-6 px-2">
            {/* СТРОКА ПОИСКА */}
            <div className="relative w-full sm:w-auto">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t("quizesPage.search", "Поиск...")}
                className="pl-8 pr-4 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all w-full sm:w-72 text-sm shadow-sm"
              />
            </div>
            <button className="p-2.5 lg:hidden inline-block bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 shadow-sm">
              <ListCollapse size={17} />
            </button>
          </div>

          <div className="px-2">
            {activeTab === "available" ? (
              // 🔥 Передаем отфильтрованные данные
              <QuizesList data={filteredAvailableQuizzes} />
            ) : (
              <>
                <ResultsList data={resultsResponse?.data} />

                {/* Рендерим пагинацию только если есть данные */}
                {resultsResponse?.meta &&
                  resultsResponse.meta.totalPages > 1 && (
                    <div className="mt-8">
                      <Pagination
                        currentPage={resultsResponse.meta.page}
                        totalPages={resultsResponse.meta.totalPages}
                        onPageChange={(newPage) => setCurrentPage(newPage)}
                      />
                    </div>
                  )}
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};
