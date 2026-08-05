import { Plus } from "lucide-react";
import { useTranslation } from "react-i18next";

type Props = {
  onClick: () => void;
};

export const QuestionAdd = ({ onClick }: Props) => {
  const { t } = useTranslation();
  return (
    <button // 🔥 МЕНЯЕМ div НА button
      type="button" // 🔥 СТАВИМ ЗАЩИТУ ОТ ОТПРАВКИ
      onClick={onClick}
      className="question__add-btn w-full text-(--main-blue) gap-1 hover:border-double hover:bg-(--main-blue) hover:text-white duration-300 mt-3 p-4 flex items-center cursor-pointer justify-center rounded-md border border-dashed border-(--main-blue)"
    >
      <Plus size={15} />
      <span>{t("quizBuilder.addQuestion")}</span>
    </button>
  );
};
