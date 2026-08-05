// features/quiz/model/types.ts

import type z from "zod";
import type { baseQuizSchema } from "./lib/schema";

export type Answer = {
  answerId?: string; // Для редактирования
  text: string;
  isCorrect: boolean;
  imageUrl?: string;
};

type QuestionType = "single" | "multiple" | "text";

export type Question = {
  text: string;
  points: number;
  answers: Answer[];
  type: QuestionType;
  questionId?: string; // Для редактирования
  imageUrl?: string;
};

export type QuizFormValues = z.infer<typeof baseQuizSchema>;
