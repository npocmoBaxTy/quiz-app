import { useState } from "react";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import { Dialog, DialogContent, DialogTitle } from "@/app/components/ui/dialog";
import { useUpdateStudent, type AssignableStudent, type StudentGroup } from "./api";

type Props = {
  // Родитель монтирует диалог с key по id студента, поэтому форма
  // инициализируется его данными без синхронизации через эффект
  student: AssignableStudent;
  groups: StudentGroup[];
  onClose: () => void;
};

export function StudentEditDialog({ student, groups, onClose }: Props) {
  const { t } = useTranslation();
  const updateStudent = useUpdateStudent();

  const [fullName, setFullName] = useState(student.full_name);
  const [email, setEmail] = useState(student.email);
  const [groupId, setGroupId] = useState(student.groupId ?? "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    updateStudent.mutate(
      {
        studentId: student.id,
        full_name: fullName.trim(),
        email: email.trim(),
        groupId: groupId || null,
      },
      {
        onSuccess: () => {
          toast.success(t("teacherStudents.saved", "Данные студента обновлены"));
          onClose();
        },
        onError: () => {
          toast.error(t("teacherStudents.saveError", "Не удалось сохранить изменения"));
        },
      },
    );
  };

  const isValid = fullName.trim().length > 0 && email.trim().length > 0;

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="z-100 rounded-3xl sm:max-w-md">
        <DialogTitle className="text-lg font-bold text-slate-900">
          {t("teacherStudents.editTitle", "Редактировать студента")}
        </DialogTitle>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              {t("teacherStudents.fullName", "ФИО")}
            </label>
            <input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              {t("teacherStudents.email", "Email")}
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              {t("teacherStudents.group", "Группа")}
            </label>
            <select
              value={groupId}
              onChange={(e) => setGroupId(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
            >
              <option value="">{t("teacherStudents.noGroup", "Без группы")}</option>
              {groups.map((group) => (
                <option key={group.id} value={group.id}>
                  {group.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl font-medium text-slate-500 hover:bg-slate-100 transition-colors"
            >
              {t("teacherStudents.cancel", "Отмена")}
            </button>
            <button
              type="submit"
              disabled={!isValid || updateStudent.isPending}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium shadow-sm transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100"
            >
              {updateStudent.isPending
                ? t("teacherStudents.saving", "Сохранение...")
                : t("teacherStudents.save", "Сохранить")}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
