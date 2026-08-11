export type BankQuestionType = "single" | "multiple" | "text";

export type BankAnswer = {
  text: string;
  isCorrect: boolean;
  imageUrl: string | null;
};

export type BankQuestion = {
  id: string;
  text: string;
  type: BankQuestionType;
  points: number;
  imageUrl: string | null;
  createdAt: string | null;
  answers: BankAnswer[];
  sources: { id: string; title: string }[];
};

export type BankQuizFacet = {
  id: string;
  title: string;
  count: number;
};

export type QuestionBankResponse = {
  items: BankQuestion[];
  total: number;
  quizzes: BankQuizFacet[];
};

export type QuestionBankParams = {
  search?: string;
  type?: string;
  quizId?: string;
  excludeQuizId?: string;
  limit?: number;
  offset?: number;
};
