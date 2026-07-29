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
  avgScore: number;
  dueDate: string | null;
  startDate: string | null;
  attemptsCount: number;
  questions_limit: number | null;
};
