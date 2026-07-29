import { useState } from "react";
import { NavLink } from "react-router-dom";
import { Plus, Loader2, AlertCircle } from "lucide-react";
import { DashboardAside } from "./components/Aside/Aside";
import { DashboardHeader } from "./components/Header/DashboardHeader";
import { useRecentAttempts } from "./hooks/useDashboardQuery";
import { useQuizzes } from "../TeacherQuizesPage/hooks/useGetQuizes";

// Импортируем наши новые чистые компоненты
import { DashboardStats } from "./components/DashboardStats";
import { RecentQuizzesList } from "./components/RecentQuizzesList";
import { LiveActivityFeed } from "./components/LiveActivityFeed";
import { TeacherQuizzesTab } from "./components/DashboardQuizesList/DashboardQuizesList";

export default function TeacherDashboard() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const { data, isLoading, isError } = useQuizzes();
  const { data: recentAttempts, isLoading: isRecentAttemptsLoading } =
    useRecentAttempts();

  if (isLoading || isRecentAttemptsLoading)
    return (
      <Loader2 className="animate-spin text-blue-500 m-auto mt-20" size={40} />
    );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row font-sans text-slate-800">
      <DashboardAside activeTab={activeTab} setActiveTab={setActiveTab} />

      {activeTab === "dashboard" && (
        <main className="flex-1 flex flex-col min-h-screen overflow-x-hidden">
          <DashboardHeader />

          <div className="p-8 w-full flex-1">
            {/* Приветствие и кнопка */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
              <div>
                <h1 className="text-2xl font-bold text-slate-900">
                  С возвращением! 👋
                </h1>
                <p className="text-slate-500 mt-1">
                  Вот что происходит с вашими тестами сегодня.
                </p>
              </div>
              <NavLink
                to="/teacher/create-quiz"
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium shadow-sm shadow-blue-200 transition-all active:scale-95"
              >
                <Plus size={18} />
                Создать тест
              </NavLink>
            </div>

            {/* Ошибки загрузки */}
            {isError && (
              <div className="flex flex-col items-center justify-center py-20 text-red-500 bg-red-50 rounded-2xl border border-red-100">
                <AlertCircle className="mb-4" size={32} />
                <p className="font-medium text-lg">
                  Не удалось загрузить данные
                </p>
                <p className="text-sm text-red-400 mt-1">
                  {"Попробуйте обновить страницу"}
                </p>
              </div>
            )}

            {/* Успешный рендер данных */}
            {data && (
              <>
                <DashboardStats data={data} />

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <RecentQuizzesList quizzes={data} />
                  <LiveActivityFeed recentAttempts={recentAttempts || []} />
                </div>
              </>
            )}
          </div>
        </main>
      )}
      {activeTab === "quizzes" && <TeacherQuizzesTab />}
    </div>
  );
}
