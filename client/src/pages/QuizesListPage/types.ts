export type Quiz = {
  id: string;
  title: string;
  passing: number;
  created_at: string;
  published: boolean;
  creator_name: string;
  time_limit: number;
  used_attempts: number;
  questions_limit: number | null;
};

export interface ResultsListProps {
  data?: QuizResult[];
}

export interface QuizResult {
  id: string;
  attemptId: string;
  quizTitle: string;
  teacherName: string;
  score: number;
  maxScore: number;
  passingScore: number;
  completedAt: string; // ISO строка даты, например "2026-04-22T14:30:00.000Z"
}
