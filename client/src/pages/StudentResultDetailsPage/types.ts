// types/resultDetails.ts (или прямо в файле компонента)
export interface ResultOption {
  id: string;
  text: string;
  isCorrect: boolean; // Правильный ли это вариант в реальности
}

export interface ResultQuestion {
  id: string;
  text: string;
  type: "single" | "multiple" | "text";
  maxPoints: number;
  earnedPoints: number; // Сколько студент получил за этот вопрос
  options: ResultOption[];
  studentAnswers: string[]; // Массив ID вариантов, которые выбрал студент (или текст для эссе)
}

export interface AttemptDetails {
  attemptId: string;
  quizTitle: string;
  score: number;
  maxScore: number;
  completedAt: string;
  questions: ResultQuestion[];
  meta: {
    total: number;
    page: number;
    totalPages: number;
    limit: number; // Нам нужен лимит для нумерации!
  };
}
