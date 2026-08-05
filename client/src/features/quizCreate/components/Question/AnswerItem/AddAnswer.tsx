import { Plus } from "lucide-react";
import { useTranslation } from "react-i18next";

export const AddAnswer = ({ onClick }: { onClick: () => void }) => {
  const { t } = useTranslation();
  return (
    <div
      onClick={onClick}
      className="add__answer--option duration-300 cursor-pointer hover:bg-blue-100 w-full p-2 rounded-md border-dotted border-muted-foreground text-xs border mt-2 flex items-center justify-center"
    >
      <div className="flex items-center">
        <Plus size={14} />
        {t("quizBuilder.addAnswerOption")}
      </div>
    </div>
  );
};
