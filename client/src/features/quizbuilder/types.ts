// ─── Domain types ─────────────────────────────────────────────────────────────

export interface Answer {
  id: string;
  text: string;
  correct: boolean;
}

export interface Question {
  id: string;
  text: string;
  explanation: string;
  points: number;
  answers: Answer[];
}

export interface QuizMeta {
  title: string;
  category: string;
  time: string;
  passing: number;
  shuffle: boolean;
  attempts: string;
}

// ─── Tab keys ─────────────────────────────────────────────────────────────────

export type TabKey = "manual" | "import" | "ai";

export interface TabDef {
  key: TabKey;
  label: string;
  count?: number;
}

// ─── Import result ────────────────────────────────────────────────────────────

export interface ParsedImport {
  questions: Question[];
  name: string;
}

// ─── Difficulty ───────────────────────────────────────────────────────────────

export type Difficulty = "easy" | "medium" | "hard";

// ─── AI raw response shape ────────────────────────────────────────────────────

export interface AIAnswer {
  text: string;
  correct: boolean;
}

export interface AIQuestion {
  text: string;
  answers: AIAnswer[];
  points?: number;
  explanation?: string;
}

// ─── Shared component props ───────────────────────────────────────────────────

export type BtnVariant = "primary" | "ghost" | "danger" | "success" | "outline";
export type BtnSize    = "md" | "sm";
export type BadgeColor = "primary" | "success" | "amber" | "danger" | "purple";