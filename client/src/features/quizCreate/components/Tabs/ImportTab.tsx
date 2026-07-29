import { FolderOpenDot } from "lucide-react";
import { useImportAiken } from "@/features/quizCreate/hooks/useImportAiken";
import { useFormContext } from "react-hook-form";
import { useEffect, useRef } from "react";
import { Spinner } from "@/shared/ui/SPinner/Spinner";
import { toast } from "react-hot-toast";
import type { QuizFormValues } from "../../types";

export const ImportTab = ({ changeTab }: { changeTab: () => void }) => {
  const form = useFormContext<QuizFormValues>();
  const { handleFileUpload, importError, isImporting, isImportSuccessful } =
    useImportAiken(form);

  // Правильный способ показывать alert при ошибках
  useEffect(() => {
    if (importError) {
      toast.error(importError);
    }

    if (isImportSuccessful) {
      changeTab();
    }
  }, [importError, isImportSuccessful]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  return (
    <div className="import__tab--wrapper p-4 bg-white">
      <div className="inner">
        <div className="import--helpers flex justify-between">
          <div className="json--helper w-[48%] bg-[#f0eeea] p-4 rounded-lg">
            <div className="title">
              <span className="inline-block mr-2 bg-[#eef0fe] px-2 py-1 rounded-lg text-xs text-(--main-blue)">
                .TXT(AIKEN)
              </span>
              <span className="text-zinc-500">Формат</span>
            </div>
            <div className="placeholder flex flex-col">
              <span>What is the capital of France?</span>
              <span>A. London</span>
              <span>B. Berlin</span>
              <span>C. Paris</span>
              <span>D. Madrid</span>
              <span>ANSWER: C</span>
            </div>
          </div>
          <div className="excel--helper w-[48%] bg-[#f0eeea] p-4 rounded-lg">
            <div className="title mb-2">
              <span className="inline-block mr-2 bg-[#fef6e7] px-2 py-1 rounded-lg text-xs text-[#f5a623]">
                .XLSX
              </span>
              <span className="text-zinc-500">Формат</span>
            </div>
            <div className="placeholder flex flex-col text-sm text-zinc-800">
              <span>question, a, b, c, d, correct, points</span>
              <span>Вопрос?, A, B, C, D, a, 1</span>
            </div>
          </div>
        </div>
        <div className="relative flex flex-col items-center gap-2 border border-zinc-400 bg-[#f0eeea] p-10 justify-center rounded-lg border-dashed mt-4 cursor-pointer">
          {!isImporting ? (
            <FolderOpenDot size={40} className="text-[#ffcc5a]" />
          ) : (
            <Spinner />
          )}
          <input
            type="file"
            accept=".txt,.xlsx"
            className="opacity-0 absolute inset-0 w-full h-full cursor-pointer z-100"
            ref={fileInputRef}
            onChange={handleFileUpload}
          />
          <span className="font-bold text-xl">Перетащите файл сюда</span>
          <span className="text-zinc-500 text-sm">
            Поддерживаемые форматы: .XLSX, .TXT
          </span>
        </div>
      </div>
    </div>
  );
};
