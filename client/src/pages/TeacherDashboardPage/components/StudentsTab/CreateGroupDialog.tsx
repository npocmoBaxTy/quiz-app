import { useState } from "react";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import { Dialog, DialogContent, DialogTitle } from "@/app/components/ui/dialog";
import { useCreateGroup } from "./api";

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

export function CreateGroupDialog({ isOpen, onClose }: Props) {
  const { t } = useTranslation();
  const createGroup = useCreateGroup();
  const [name, setName] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;

    createGroup.mutate(trimmed, {
      onSuccess: () => {
        toast.success(t("teacherStudents.groupCreated", "Группа создана"));
        setName("");
        onClose();
      },
      onError: () => {
        toast.error(t("teacherStudents.groupCreateError", "Не удалось создать группу"));
      },
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="z-100 rounded-3xl sm:max-w-md">
        <DialogTitle className="text-lg font-bold text-slate-900">
          {t("teacherStudents.createGroupTitle", "Новая группа")}
        </DialogTitle>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              {t("teacherStudents.groupName", "Название группы")}
            </label>
            <input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t("teacherStudents.groupNamePlaceholder", "Например: ПИ-21")}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
            />
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl font-medium text-slate-500 hover:bg-slate-100 transition-colors"
            >
              {t("teacherStudents.cancel", "Отмена")}
            </button>
            <button
              type="submit"
              disabled={!name.trim() || createGroup.isPending}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium shadow-sm transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100"
            >
              {createGroup.isPending
                ? t("teacherStudents.creating", "Создание...")
                : t("teacherStudents.create", "Создать")}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
