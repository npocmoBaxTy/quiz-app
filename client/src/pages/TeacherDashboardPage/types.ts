export interface DashboardStats {
  activeQuizzes: number;
  totalStudents: number;
  avgScore: number;
  needsReview: number;
}

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
};

export interface Activity {
  id: string;
  studentName: string;
  quizTitle: string;
  score: string;
  timeAgo: string;
  status: "excellent" | "warning" | "good";
}

export interface DashboardData {
  stats: DashboardStats;
  quizzes: Quiz[];
  activities: Activity[];
}
