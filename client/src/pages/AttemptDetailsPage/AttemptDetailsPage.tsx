import { useParams, useNavigate } from "react-router-dom";
import { useGetAttemptDetails } from "./hooks/useAttemptDetails"; // ВАШ ПУТЬ
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  User,
  Award,
  HelpCircle,
} from "lucide-react";
import type {
  AttemptAnswer,
  AttemptOption,
} from "@/features/getAttemptDetails/types/types";

export const AttemptDetailsPage = () => {
  // Достаем ID попытки из URL
  const { attemptId } = useParams<{ attemptId: string }>();
  const navigate = useNavigate();

  // Получаем данные с бэкенда
  const { data, isLoading, isError } = useGetAttemptDetails(attemptId);

  if (isLoading)
    return (
      <div className="p-10 flex justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  if (isError || !data?.attempt)
    return (
      <div className="p-10 text-center text-red-500">
        Не удалось загрузить данные попытки.
      </div>
    );

  const { attempt, answers } = data;

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-6">
      {/* --- ШАПКА --- */}
      <header className="flex items-center gap-4 bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
        <button
          onClick={() => navigate(-1)} // Возвращаемся назад к списку студентов
          className="p-2.5 text-slate-400 hover:bg-slate-100 rounded-xl transition-colors"
          title="Назад к списку"
        >
          <ArrowLeft size={20} />
        </button>

        <div className="flex-1">
          <h1 className="text-xl font-bold flex items-center gap-2 text-slate-800">
            <User size={20} className="text-blue-500" />
            {attempt.full_name}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Статус:{" "}
            <span className="font-medium text-slate-700 bg-slate-100 px-2 py-0.5 rounded ml-1">
              {attempt.status}
            </span>
          </p>
        </div>

        <div className="text-right bg-blue-50 px-6 py-3 rounded-xl border border-blue-100">
          <div className="text-3xl font-black text-blue-600 flex items-center gap-2 justify-end">
            <Award size={24} />
            {attempt.score}
          </div>
          <p className="text-[10px] uppercase tracking-widest text-blue-400 font-bold mt-1">
            Итоговый балл
          </p>
        </div>
      </header>

      {/* --- СПИСОК ВОПРОСОВ --- */}
      <div className="space-y-6">
        {answers?.map((ans: AttemptAnswer, index: number) => (
          <div
            key={ans.answerId}
            className="bg-white p-6 md:p-8 rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden"
          >
            {/* Декоративная полоска слева */}
            <div
              className={`absolute left-0 top-0 bottom-0 w-1.5 ${ans.isCorrect ? "bg-green-500" : "bg-red-500"}`}
            ></div>

            {/* Заголовок вопроса */}
            <div className="flex justify-between items-start mb-6 border-b border-slate-50 pb-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1 flex items-center gap-1.5">
                  <HelpCircle size={14} /> Вопрос {index + 1}{" "}
                  <span className="text-slate-300">•</span> {ans.points} баллов
                </span>
                <h3 className="text-lg font-semibold text-slate-800 leading-snug">
                  {ans.questionText}
                </h3>
              </div>

              {/* Статус ответа */}
              {ans.isCorrect ? (
                <div className="flex items-center gap-1.5 text-green-700 bg-green-50 px-3 py-1.5 rounded-lg font-medium text-sm border border-green-100 shrink-0">
                  <CheckCircle2 size={18} className="text-green-500" /> Верно
                </div>
              ) : (
                <div className="flex items-center gap-1.5 text-red-700 bg-red-50 px-3 py-1.5 rounded-lg font-medium text-sm border border-red-100 shrink-0">
                  <XCircle size={18} className="text-red-500" /> Ошибка
                </div>
              )}
            </div>

            {/* ВАРИАНТЫ ОТВЕТОВ (Тестовые вопросы) */}
            {(ans.questionType === "single" ||
              ans.questionType === "multiple") && (
              <div className="grid gap-3">
                {ans.options?.map((opt: AttemptOption) => {
                  const isSelectedByStudent = opt.id === ans.selectedOptionId;
                  const isCorrectAnswer = opt.isCorrect;

                  // Логика раскраски вариантов
                  let containerStyle =
                    "border-slate-200 bg-white text-slate-600";
                  let icon = null;
                  let badge = null;

                  if (isSelectedByStudent && isCorrectAnswer) {
                    containerStyle =
                      "border-green-500 bg-green-50 text-green-800 font-medium shadow-sm";
                    icon = (
                      <CheckCircle2 size={20} className="text-green-600" />
                    );
                    badge = "Выбор студента";
                  } else if (isSelectedByStudent && !isCorrectAnswer) {
                    containerStyle =
                      "border-red-500 bg-red-50 text-red-800 font-medium shadow-sm";
                    icon = <XCircle size={20} className="text-red-600" />;
                    badge = "Ошибка студента";
                  } else if (!isSelectedByStudent && isCorrectAnswer) {
                    containerStyle =
                      "border-green-400 bg-green-50/40 text-green-700 border-dashed";
                    icon = (
                      <CheckCircle2
                        size={20}
                        className="text-green-500 opacity-60"
                      />
                    );
                    badge = "Правильный ответ";
                  }

                  return (
                    <div
                      key={opt.id}
                      className={`p-4 rounded-xl border flex justify-between items-center transition-all ${containerStyle}`}
                    >
                      <span className="flex-1 pr-4">{opt.text}</span>

                      <div className="flex items-center gap-3 shrink-0">
                        {badge && (
                          <span
                            className={`text-[10px] uppercase font-bold px-2 py-1 rounded-md shadow-sm opacity-90
                            ${isSelectedByStudent ? "bg-white" : "bg-transparent text-green-600"}`}
                          >
                            {badge}
                          </span>
                        )}
                        {icon}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* ТЕКСТОВЫЙ ОТВЕТ */}
            {ans.questionType === "text" && (
              <div className="mt-2">
                <p className="text-xs font-bold text-slate-400 mb-2 uppercase">
                  Ответ студента:
                </p>
                <div
                  className={`p-5 rounded-xl border ${ans.isCorrect ? "bg-green-50 border-green-200 text-green-800" : "bg-slate-50 border-slate-200 text-slate-700"}`}
                >
                  {ans.textAnswer ? (
                    <span className="whitespace-pre-wrap">
                      {ans.textAnswer}
                    </span>
                  ) : (
                    <span className="italic text-slate-400">
                      Студент не дал ответ на этот вопрос
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}

        {/* Если массив ответов пустой */}
        {answers?.length === 0 && (
          <div className="p-10 text-center bg-white rounded-2xl border border-slate-100">
            <p className="text-slate-500">
              В этой попытке нет сохраненных ответов.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
