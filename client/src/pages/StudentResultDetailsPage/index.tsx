import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Check, CheckCircle2, X, XCircle } from "lucide-react";
import { motion } from "framer-motion";
import { useAttemptDetails } from "./hooks/useStudentAttemptDetails";
import { Pagination } from "@/shared/ui/Pagination/Pagination";
import { useState } from "react";

export const StudentResultDetailsPage = () => {
  const { attemptId } = useParams<{ attemptId: string }>();
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);

  // 🔥 Вызываем наш реальный хук:
  const { data, isLoading, isError } = useAttemptDetails(
    attemptId,
    currentPage,
  );

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    // Плавно скроллим страницу наверх к началу вопросов
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (isLoading)
    return (
      <div className="p-20 text-center text-slate-500">
        Загрузка результатов...
      </div>
    );
  if (isError || !data)
    return (
      <div className="p-20 text-center text-red-500">
        Ошибка загрузки результатов
      </div>
    );

  const percentage =
    data.maxScore > 0 ? Math.round((data.score / data.maxScore) * 100) : 0;

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20">
      <div className="max-w-4xl mx-auto pt-8 px-4">
        {/* 1. Кнопка "Назад" */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors mb-6 font-medium"
        >
          <ArrowLeft size={20} /> Вернуться к списку
        </button>

        {/* 2. Шапка с общим итогом */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-6 md:p-8 border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-center gap-6 mb-8"
        >
          <div>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">
              Разбор ошибок
            </p>
            <h1 className="text-2xl md:text-2xl font-bold text-slate-900">
              {data.quizTitle}
            </h1>
          </div>

          <div className="flex items-center gap-6 bg-slate-50 px-6 py-4 rounded-xl border border-slate-100">
            <div className="text-center">
              <p className="text-xs text-slate-500 font-medium mb-1">
                ВАШ БАЛЛ
              </p>
              <p className="text-2xl font-black text-indigo-600">
                {data.score}{" "}
                <span className="text-lg text-slate-400">
                  / {data.maxScore}
                </span>
              </p>
            </div>
            <div className="w-px h-12 bg-slate-200"></div>
            <div className="text-center">
              <p className="text-xs text-slate-500 font-medium mb-1">
                УСПЕШНОСТЬ
              </p>
              <p
                className={`text-2xl font-bold ${percentage >= 60 ? "text-green-500" : "text-red-500"}`}
              >
                {percentage}%
              </p>
            </div>
          </div>
        </motion.div>

        {/* 3. Список вопросов */}
        <div className="space-y-6">
          {data.questions.map((question, index) => {
            const isFullyCorrect = question.earnedPoints === question.maxPoints;
            const isWrong = question.earnedPoints === 0;
            const cardBorderColor = isFullyCorrect
              ? "border-indigo-500/80"
              : isWrong
                ? "border-red-400"
                : "border-amber-400";
            const StatusIcon = isFullyCorrect ? (
              <CheckCircle2 className="text-indigo-600 shrink-0" size={24} />
            ) : (
              <XCircle className="text-red-500 shrink-0" size={24} />
            );

            // 🔥 Вычисляем реальный номер вопроса (например, страница 2, индекс 0 -> вопрос 11)
            const globalQuestionNumber =
              (data.meta.page - 1) * data.meta.limit + index + 1;

            return (
              <motion.div
                key={question.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`bg-white rounded-[20px] p-6 sm:p-8 border-[1.5px] shadow-sm ${cardBorderColor}`}
              >
                <div className="flex items-start gap-4 mb-6">
                  <div className="mt-0.5">{StatusIcon}</div>
                  <h3 className="text-lg font-bold text-slate-800 leading-snug wrap-break-word">
                    {/* Выводим правильный номер! */}
                    <span className="text-slate-400 mr-2">
                      {globalQuestionNumber}.
                    </span>
                    <span className="break-all">{question.text}</span>
                  </h3>
                </div>

                {/* Варианты ответов */}
                <div className="space-y-3 md:pl-10">
                  {question.type === "text" ? (
                    // Отрисовка для эссе (текстовый ответ)
                    <div
                      className={`px-5 py-4 rounded-xl border ${isWrong ? "bg-red-50/50 border-red-100 text-red-900" : "bg-[#F0FDF4] border-[#BBF7D0] text-[#166534]"}`}
                    >
                      <p className="text-xs font-bold opacity-50 uppercase tracking-wider mb-2">
                        Ваш ответ:
                      </p>
                      <p className="font-medium">
                        {question.studentAnswers[0] || "Нет ответа"}
                      </p>
                    </div>
                  ) : (
                    // Отрисовка для тестов с выбором (single/multiple)
                    question.options.map((opt) => {
                      const isSelected = question.studentAnswers.includes(
                        opt.id,
                      );
                      const isCorrectAnswer = opt.isCorrect;

                      // Имитируем цвета в точности как на вашем скриншоте
                      let optionClass = "";

                      if (isSelected && isCorrectAnswer) {
                        // Выбран правильно: светло-зеленый фон, зеленый текст и нежная зеленая обводка
                        optionClass =
                          "bg-[#F0FDF4] text-[#166534] border-[#BBF7D0] shadow-sm";
                      } else if (isSelected && !isCorrectAnswer) {
                        // Выбрана ошибка: светло-красный
                        optionClass =
                          "bg-red-50 text-red-800 border-red-200 shadow-sm";
                      } else if (!isSelected && isCorrectAnswer) {
                        // Пропущенный правильный ответ: делаем его очевидным, но не агрессивным (пунктир)
                        optionClass =
                          "bg-[#F0FDF4]/50 text-[#166534]/70 border-[#BBF7D0] border-dashed";
                      } else {
                        // Обычный невыбранный вариант: очень легкий серый фон
                        optionClass =
                          "bg-[#F8FAFC] text-slate-600 border-transparent hover:border-slate-200";
                      }

                      return (
                        <div
                          key={opt.id}
                          className={`px-5 py-3.5 border rounded-xl transition-colors font-medium text-[15px] leading-relaxed flex items-center justify-between ${optionClass}`}
                        >
                          <span>{opt.text}</span>

                          {/* Опционально: можно добавить маленькие иконки прямо внутрь варианта */}
                          {isSelected && isCorrectAnswer && (
                            <Check
                              size={18}
                              className="text-[#166534] shrink-0 ml-4"
                            />
                          )}
                          {isSelected && !isCorrectAnswer && (
                            <X
                              size={18}
                              className="text-red-600 shrink-0 ml-4"
                            />
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
        {data.meta && (
          <div className="mt-12">
            <Pagination
              currentPage={data.meta.page}
              totalPages={data.meta.totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        )}
      </div>
    </div>
  );
};
