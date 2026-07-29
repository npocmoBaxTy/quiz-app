export type QuestionType = "single" | "multiple" | "text";

export type Question = {
  id: string;
  text: string;
  type: QuestionType;
  points: number;
  order: number;

  options?: {
    id: string;
    text: string;
  }[];
};

export interface QuizResponseItem {
  questionId: string;
  type: "text" | "multiple" | "single";
  values: string[];
}

export interface SubmitQuizBody {
  attemptId: string; // 🔥 Обязательно ждем ID текущей попытки от клиента
  quizId: string;
  responses: QuizResponseItem[];
  ticketQuestionIds: string[];
}

export interface SubmitQuizResponse {
  success: boolean;
  attemptId: string;
  score: number;
  message: string;
  maxScore: number;
}
