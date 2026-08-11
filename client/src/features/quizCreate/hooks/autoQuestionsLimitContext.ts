import { createContext, useContext } from "react";

export type AutoQuestionsLimit = {
  /** лимит считается автоматически по количеству вопросов */
  isAuto: boolean;
  setIsAuto: (value: boolean) => void;
  questionsCount: number;
};

export const AutoQuestionsLimitContext =
  createContext<AutoQuestionsLimit | null>(null);

export function useAutoQuestionsLimit(): AutoQuestionsLimit {
  const ctx = useContext(AutoQuestionsLimitContext);
  if (!ctx) {
    throw new Error(
      "useAutoQuestionsLimit должен вызываться внутри AutoQuestionsLimitProvider",
    );
  }
  return ctx;
}
