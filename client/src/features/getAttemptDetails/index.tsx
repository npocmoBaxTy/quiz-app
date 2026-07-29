import { useParams, useNavigate } from "react-router-dom";
import { useGetQuizAttempts } from "./hooks/useAttemptDetails";
import { ChevronRight, User, Trophy, ArrowLeft } from "lucide-react";

export const QuizAttemptsPage = () => {
  const { quizId } = useParams<{ quizId: string }>(); // Достаем ID теста из URL
  const navigate = useNavigate();

  const { data: attempts, isLoading, isError } = useGetQuizAttempts(quizId);

  if (isLoading)
    return (
      <div className="p-10 text-center text-slate-500">
        Загрузка результатов...
      </div>
    );
  if (isError)
    return (
      <div className="p-10 text-center text-red-500">
        Ошибка при загрузке данных
      </div>
    );

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      {/* Навигация назад */}
      <button
        onClick={() => navigate("/user/profile")}
        className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors text-sm font-medium"
      >
        <ArrowLeft size={16} /> Назад к тестам
      </button>

      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Результаты теста
          </h1>
          <p className="text-slate-500 mt-1">
            Список студентов и их итоговые баллы
          </p>
        </div>
        <div className="text-sm font-medium text-slate-400 bg-slate-100 px-3 py-1 rounded-full">
          Всего попыток: {attempts?.length || 0}
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-4 text-xs font-semibold uppercase text-slate-400">
                Студент
              </th>
              <th className="px-6 py-4 text-xs font-semibold uppercase text-slate-400 text-center">
                Балл
              </th>
              <th className="px-6 py-4 text-xs font-semibold uppercase text-slate-400 text-center">
                Дата сдачи
              </th>
              <th className="px-6 py-4"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {attempts?.map((attempt) => (
              <tr
                key={attempt.id}
                className="hover:bg-blue-50/50 transition-colors group cursor-pointer"
                onClick={() =>
                  navigate(`/teacher/student-attempt/${attempt.id}`)
                }
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                      <User size={20} />
                    </div>
                    <span className="font-bold text-slate-700">
                      {attempt.studentName}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div
                    className={`mx-auto w-10 h-10 rounded-xl flex items-center justify-center font-black border-2
                    ${
                      attempt.score >= 70
                        ? "bg-green-50 border-green-100 text-green-600"
                        : attempt.score >= 40
                          ? "bg-yellow-50 border-yellow-100 text-yellow-600"
                          : "bg-red-50 border-red-100 text-red-600"
                    }`}
                  >
                    {attempt.score}
                  </div>
                </td>
                <td className="px-6 py-4 text-center text-slate-500 text-sm">
                  {attempt.finishedAt
                    ? new Date(attempt.finishedAt).toLocaleDateString()
                    : "—"}
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-end gap-1 font-medium text-sm">
                    Смотреть работу <ChevronRight size={16} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {attempts?.length === 0 && (
          <div className="p-20 text-center">
            <Trophy size={48} className="mx-auto text-slate-200 mb-4" />
            <p className="text-slate-400 font-medium">
              Пока никто не завершил этот тест
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
