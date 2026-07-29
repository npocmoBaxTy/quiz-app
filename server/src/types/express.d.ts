import { JwtPayload } from "jsonwebtoken";

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload & {
        userId: string;
        role: string;
      };
    }
  }
}

export type Answer = {
  id?: string; // Для редактирования
  text: string;
  isCorrect: boolean;
};

type QuestionType = "single" | "multiple" | "text";

export type Question = {
  text: string;
  points: number;
  answers: Answer[];
  type: QuestionType;
  id?: string; // Для редактирования
};

export {};
