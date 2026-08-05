// Текстовые вопросы не проверяются автоматически, поэтому в аналитику не попадают
export type QuestionType = "single" | "multiple";

export interface TimelinePoint {
  attemptId: string;
  quizTitle: string | null;
  passing: number | null;
  completedAt: string | null;
  percentage: number;
}

export interface QuestionTypeStat {
  type: QuestionType;
  total: number;
  correct: number;
  percentage: number | null;
}

export interface AnalyticsSummary {
  totalAttempts: number;
  averagePercent: number | null;
  recentAveragePercent: number | null;
  bestPercent: number | null;
  passedCount: number;
}

export interface StudentAnalytics {
  timeline: TimelinePoint[];
  byQuestionType: QuestionTypeStat[];
  summary: AnalyticsSummary;
}
