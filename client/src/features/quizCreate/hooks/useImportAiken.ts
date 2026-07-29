import { type ChangeEvent, useState } from "react";
import { type UseFormReturn } from "react-hook-form";
import type { Question, QuizFormValues } from "../types";

export const useImportAiken = (form: UseFormReturn<QuizFormValues>) => {
  const { setValue } = form;
  const [isImporting, setIsImporting] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const [isImportSuccessful, setIsImportSuccessful] = useState(false);

  const handleFileUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    setImportError(null);

    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const lines = content
          .split("\n")
          .map((l) => l.trim())
          .filter(Boolean);

        const mappedQuestions: Question[] = [];
        let currentQuestionText = "";
        let currentOptions: { letter: string; text: string }[] = [];

        for (const line of lines) {
          // Поиск правильного ответа (теперь с поддержкой кириллицы)
          const answerMatch = line.match(/^ANSWER:\s*([A-ZА-ЯЁ])\s*$/i);

          if (answerMatch) {
            const correctLetter = answerMatch[1].toUpperCase();
            const answers = currentOptions.map((opt) => ({
              text: opt.text,
              isCorrect: opt.letter === correctLetter,
            }));

            mappedQuestions.push({
              text: currentQuestionText,
              points: 2,
              type: "single",
              answers: answers,
            });

            currentQuestionText = "";
            currentOptions = [];
            continue;
          }

          // Поиск вариантов (исправленная регулярка без Unnecessary escape)
          const optionMatch = line.match(/^([A-ZА-ЯЁ])[.)]\s+(.*)/i);

          if (optionMatch) {
            currentOptions.push({
              letter: optionMatch[1].toUpperCase(),
              text: optionMatch[2].trim(),
            });
            continue;
          }

          if (!currentQuestionText) {
            currentQuestionText = line;
          } else {
            currentQuestionText += " " + line;
          }
        }
        setValue("questions", mappedQuestions, {
          shouldDirty: true,
          shouldValidate: true,
        });
      } catch (error) {
        console.error("Ошибка парсинга:", error);
        setImportError("Неверный формат Aiken в файле.");
      } finally {
        setIsImporting(false);
        event.target.value = "";
        setIsImportSuccessful(true);
      }
    };

    reader.onerror = () => {
      setImportError("Ошибка чтения файла.");
      setIsImporting(false);
    };

    reader.readAsText(file);
  };

  return { handleFileUpload, isImporting, importError, isImportSuccessful };
};
