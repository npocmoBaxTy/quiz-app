export type Quiz = {
  id: string;
  title: string;
  passing: number;
  created_at: string;
  published: boolean;
  questions_count: number;
  creator_name: string;
  time_limit: number;
  attempt_limit: number;
  attemptsCount: number;
  avgScore: number;
  dueDate: string | null;
  startDate: string | null;
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
