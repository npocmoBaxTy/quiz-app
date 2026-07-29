import { useState, useEffect, type ChangeEvent } from "react";
import { useFormContext } from "react-hook-form";
import { Search, Calendar, Users, User, Check, Loader2 } from "lucide-react";
import { useGroupsAndStudents } from "./../hooks/useQuizAssigments"; // Оставляем только GET-запрос
import { FieldInput } from "@/features/auth/ui/FieldInput";

export const QuizAssigments = () => {
  const [activeTab, setActiveTab] = useState<"groups" | "students">("groups");
  const [searchQuery, setSearchQuery] = useState("");

  // Подключаемся к глобальной форме конструктора
  const { watch, setValue, register } = useFormContext();

  // Читаем текущие значения из формы (если их нет, ставим пустые массивы)
  const selectedGroups: string[] = watch("assignedGroups") || [];
  const selectedStudents: string[] = watch("assignedStudents") || [];

  // Получаем списки с бэкенда для отображения
  const { data, isLoading } = useGroupsAndStudents();

  // Инициализация пустых массивов при первом рендере, если их нет
  useEffect(() => {
    if (!watch("assignedGroups")) setValue("assignedGroups", []);
    if (!watch("assignedStudents")) setValue("assignedStudents", []);
  }, [setValue, watch]);

  // --- ЛОГИКА ВЫБОРА (ОБНОВЛЯЕТ ФОРМУ) ---
  const toggleSelection = (id: string, type: "group" | "student") => {
    if (type === "group") {
      const newGroups = selectedGroups.includes(id)
        ? selectedGroups.filter((g) => g !== id)
        : [...selectedGroups, id];
      setValue("assignedGroups", newGroups, { shouldDirty: true });
    } else {
      const newStudents = selectedStudents.includes(id)
        ? selectedStudents.filter((s) => s !== id)
        : [...selectedStudents, id];
      setValue("assignedStudents", newStudents, { shouldDirty: true });
    }
  };

  // Фильтрация для поиска
  const filteredGroups =
    data?.groups.filter((g) =>
      g.name.toLowerCase().includes(searchQuery.toLowerCase()),
    ) || [];
  const filteredStudents =
    data?.students.filter((s) =>
      s.full_name.toLowerCase().includes(searchQuery.toLowerCase()),
    ) || [];

  return (
    <div className="flex flex-col lg:flex-row gap-8 bg-white p-6 rounded-2xl border border-slate-200 mt-4">
      {/* ЛЕВАЯ КОЛОНКА: Выбор аудитории */}
      <div className="flex-1 flex flex-col gap-5">
        <h3 className="text-lg font-bold text-slate-800">
          Кому доступен тест?
        </h3>

        {/* ТАБЫ */}
        <div className="flex p-1 bg-slate-100 rounded-xl">
          <button
            type="button" // ОБЯЗАТЕЛЬНО type="button", чтобы не отправить форму
            onClick={() => setActiveTab("groups")}
            className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-lg transition-all ${
              activeTab === "groups"
                ? "bg-white text-blue-600 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            <Users size={18} /> Группы
            {selectedGroups.length > 0 && (
              <span className="bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full text-xs">
                {selectedGroups.length}
              </span>
            )}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("students")}
            className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-lg transition-all ${
              activeTab === "students"
                ? "bg-white text-blue-600 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            <User size={18} /> Студенты
            {selectedStudents.length > 0 && (
              <span className="bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full text-xs">
                {selectedStudents.length}
              </span>
            )}
          </button>
        </div>

        {/* ПОИСК */}
        <div className="relative">
          <FieldInput
            type="text"
            value={searchQuery}
            textChange={(e: ChangeEvent<HTMLInputElement>) =>
              setSearchQuery(e.target.value)
            }
            placeholder="Поиск..."
          >
            <Search className="text-slate-400" size={18} />
          </FieldInput>
        </div>

        {/* СПИСОК */}
        <div className="flex-1 border border-slate-200 rounded-xl overflow-hidden bg-white min-h-62.5 max-h-87.5 flex flex-col">
          {isLoading ? (
            <div className="flex-1 flex justify-center items-center text-slate-400">
              <Loader2 className="animate-spin" size={28} />
            </div>
          ) : activeTab === "groups" ? (
            <div className="divide-y divide-slate-100 overflow-y-auto">
              {filteredGroups.map((group) => (
                <div
                  key={group.id}
                  onClick={() => toggleSelection(group.id, "group")}
                  className="flex items-center gap-4 p-3.5 hover:bg-slate-50 cursor-pointer transition-colors group"
                >
                  <div
                    className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${
                      selectedGroups.includes(group.id)
                        ? "bg-blue-500 border-blue-500 text-white"
                        : "border-slate-300"
                    }`}
                  >
                    {selectedGroups.includes(group.id) && (
                      <Check size={14} strokeWidth={3} />
                    )}
                  </div>
                  <span className="font-medium text-slate-700">
                    {group.name}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="divide-y divide-slate-100 overflow-y-auto">
              {filteredStudents.map((student) => (
                <div
                  key={student.id}
                  onClick={() => toggleSelection(student.id, "student")}
                  className="flex items-center gap-4 p-3.5 hover:bg-slate-50 cursor-pointer transition-colors group"
                >
                  <div
                    className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${
                      selectedStudents.includes(student.id)
                        ? "bg-blue-500 border-blue-500 text-white"
                        : "border-slate-300"
                    }`}
                  >
                    {selectedStudents.includes(student.id) && (
                      <Check size={14} strokeWidth={3} />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-slate-700 leading-tight">
                      {student.full_name}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {student.groupName}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ПРАВАЯ КОЛОНКА: Сроки (Регистрируем напрямую в форму) */}
      <div className="lg:w-72 flex flex-col gap-6">
        <h3 className="text-lg font-bold text-slate-800">Сроки проведения</h3>

        <div className="bg-slate-50 p-5 border border-slate-200 rounded-xl flex flex-col gap-5">
          <div>
            <label className="text-sm font-semibold text-slate-700 mb-1.5 flex items-center gap-2">
              <Calendar size={16} className="text-blue-500" /> Дата начала
            </label>
            <input
              type="datetime-local"
              {...register("startDate")} // Подключаем к react-hook-form напрямую!
              className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-500 transition-all"
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-slate-700 mb-1.5 flex items-center gap-2">
              <Calendar size={16} className="text-red-400" /> Жесткий дедлайн
            </label>
            <input
              type="datetime-local"
              {...register("dueDate")} // Подключаем к react-hook-form напрямую!
              className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-500 transition-all"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
