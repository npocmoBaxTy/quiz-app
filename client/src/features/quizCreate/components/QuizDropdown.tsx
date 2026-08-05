import { Button } from "@/app/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/app/components/ui/dropdown-menu";
import { C } from "@/features/quizbuilder/constants";
import { MoveDown } from "lucide-react";
import { useTranslation } from "react-i18next";

export function QuizDropdown({
  items,
  label,
  onSelect,
  value,
}: {
  items: string[];
  label: string;
  onSelect: (v: string) => void;
  value?: string;
}) {
  const { t } = useTranslation();
  return (
    <DropdownMenu>
      <label
        htmlFor="#"
        style={{ color: C.muted }}
        className="text-sm mb-1 block"
      >
        {label}
      </label>
      <DropdownMenuTrigger asChild>
        <div className="flex justify-between items-center border px-4 rounded-md">
          <Button variant="ghost" className="p-0 hover:bg-transparent text-xs">
            {value ?? t("quizBuilder.selectPlaceholder")}
          </Button>
          <MoveDown size={14} />
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-40" align="start">
        <DropdownMenuGroup>
          {items.map((item) => (
            <DropdownMenuItem onClick={() => onSelect(item)}>
              {item}
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
