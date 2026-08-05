import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Plus,
  Search,
  Users,
  Loader2,
  AlertCircle,
  Pencil,
  UsersRound,
} from "lucide-react";
import { Header } from "@/widgets/header/header";
import { useAssignableUsers, type AssignableStudent } from "./api";
import { StudentEditDialog } from "./StudentEditDialog";
import { CreateGroupDialog } from "./CreateGroupDialog";

const ALL_GROUPS = "all";
const NO_GROUP = "none";

export function StudentsTab() {
  const { t } = useTranslation();
  const { data, isLoading, isError } = useAssignableUsers();

  const [searchQuery, setSearchQuery] = useState("");
  const [groupFilter, setGroupFilter] = useState<string>(ALL_GROUPS);
  const [editing, setEditing] = useState<AssignableStudent | null>(null);
  const [isCreatingGroup, setIsCreatingGroup] = useState(false);

  const filteredStudents = useMemo(() => {
    if (!data) return [];
    const query = searchQuery.trim().toLowerCase();

    return data.students.filter((student) => {
      const matchesSearch =
        !query ||
        student.full_name.toLowerCase().includes(query) ||
        student.email.toLowerCase().includes(query);

      const matchesGroup =
        groupFilter === ALL_GROUPS
          ? true
          : groupFilter === NO_GROUP
            ? student.groupId === null
            : student.groupId === groupFilter;

      return matchesSearch && matchesGroup;
    });
  }, [data, searchQuery, groupFilter]);

  return (
    <main className="flex-1 flex flex-col min-h-screen overflow-x-hidden">
      <Header />

      <div className="p-8 w-full flex-1">
        {/* Заголовок и действие */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              {t("teacherStudents.title", "Студенты")}
            </h1>
            <p className="text-slate-500 mt-1">
              {t("teacherStudents.subtitle", "Списки групп и данные студентов")}
            </p>
          </div>
          <button
            onClick={() => setIsCreatingGroup(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium shadow-sm shadow-blue-200 transition-all active:scale-95"
          >
            <Plus size={18} />
            {t("teacherStudents.createGroup", "Создать группу")}
          </button>
        </div>

        {isLoading && (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <Loader2 className="animate-spin mb-4" size={32} />
            <p>{t("teacherStudents.loading", "Загрузка...")}</p>
          </div>
        )}

        {isError && (
          <div className="flex flex-col items-center justify-center py-20 text-red-500 bg-red-50 rounded-2xl border border-red-100">
            <AlertCircle className="mb-4" size={32} />
            <p className="font-medium text-lg">
              {t("teacherStudents.loadError", "Не удалось загрузить список студентов")}
            </p>
          </div>
        )}

        {data && (
          <>
            {/* Сводка */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-8">
              <StatTile
                icon={<Users size={20} />}
                label={t("teacherStudents.totalStudents", "Всего студентов")}
                value={data.students.length}
              />
              <StatTile
                icon={<UsersRound size={20} />}
                label={t("teacherStudents.totalGroups", "Групп")}
                value={data.groups.length}
              />
            </div>

            {/* Поиск и фильтр */}
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <div className="relative flex-1">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  size={18}
                />
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t("teacherStudents.search", "Поиск по имени или email")}
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all text-sm"
                />
              </div>
              <select
                value={groupFilter}
                onChange={(e) => setGroupFilter(e.target.value)}
                className="px-4 py-2.5 bg-white border border-slate-200 rounded-lg outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all text-sm sm:w-56"
              >
                <option value={ALL_GROUPS}>
                  {t("teacherStudents.allGroups", "Все группы")}
                </option>
                {data.groups.map((group) => (
                  <option key={group.id} value={group.id}>
                    {group.name}
                  </option>
                ))}
                <option value={NO_GROUP}>
                  {t("teacherStudents.noGroup", "Без группы")}
                </option>
              </select>
            </div>

            {/* Таблица */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              {filteredStudents.length === 0 ? (
                <div className="py-16 text-center text-slate-500">
                  {data.students.length === 0
                    ? t("teacherStudents.empty", "Студентов пока нет")
                    : t("teacherStudents.nothingFound", "Ничего не найдено")}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b border-slate-200">
                      <tr>
                        <Th>{t("teacherStudents.fullName", "ФИО")}</Th>
                        <Th>{t("teacherStudents.email", "Email")}</Th>
                        <Th>{t("teacherStudents.group", "Группа")}</Th>
                        <th className="w-16" />
                      </tr>
                    </thead>
                    <tbody>
                      {filteredStudents.map((student) => (
                        <tr
                          key={student.id}
                          className="border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors"
                        >
                          <td className="px-6 py-4 font-medium text-slate-800">
                            {student.full_name}
                          </td>
                          <td className="px-6 py-4 text-slate-500 text-sm">
                            {student.email}
                          </td>
                          <td className="px-6 py-4">
                            {student.groupName ? (
                              <span className="inline-block px-2.5 py-1 bg-blue-50 text-blue-700 rounded-md text-xs font-bold">
                                {student.groupName}
                              </span>
                            ) : (
                              <span className="inline-block px-2.5 py-1 bg-slate-100 text-slate-500 rounded-md text-xs font-bold">
                                {t("teacherStudents.noGroup", "Без группы")}
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button
                              onClick={() => setEditing(student)}
                              aria-label={t("teacherStudents.edit", "Редактировать")}
                              className="p-2 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                            >
                              <Pencil size={16} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {editing && (
        <StudentEditDialog
          key={editing.id}
          student={editing}
          groups={data?.groups ?? []}
          onClose={() => setEditing(null)}
        />
      )}
      <CreateGroupDialog
        isOpen={isCreatingGroup}
        onClose={() => setIsCreatingGroup(false)}
      />
    </main>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">
      {children}
    </th>
  );
}

function StatTile({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
}) {
  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex items-center gap-4">
      <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
        {icon}
      </div>
      <div>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
          {label}
        </p>
        <p className="text-2xl font-black text-slate-900 leading-tight">{value}</p>
      </div>
    </div>
  );
}
