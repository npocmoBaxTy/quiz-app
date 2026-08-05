export type QuestionType = "single" | "multiple" | "text";

/**
 * Ровно то, что отдаёт GET /api/get-quiz-by-id/:quizId.
 * Отдельный тип, потому что списочные Quiz на страницах преподавателя и
 * студента описывают другие ответы сервера и с этим не совпадают.
 */
export type TakingQuiz = {
  id: string;
  title: string;
  passing: number;
  time_limit: number;
  questions_limit: number | null;
  published: boolean;
  created_at: string;
};

export type Question = {
  id: string;
  text: string;
  type: QuestionType;
  points: number;
  order: number;
  imageUrl?: string | null;

  options?: {
    id: string;
    text: string;
    imageUrl?: string | null;
  }[];
};

export interface QuizResponseItem {
  questionId: string;
  type: "text" | "multiple" | "single";
  values: string[];
}

// Состав билета и его стоимость сервер берёт из попытки, а не из запроса,
// поэтому клиенту достаточно передать её id и сами ответы.
export interface SubmitQuizBody {
  attemptId: string;
  responses: QuizResponseItem[];
}

export interface SubmitQuizResponse {
  success: boolean;
  attemptId: string;
  score: number;
  message: string;
  maxScore: number;
}
