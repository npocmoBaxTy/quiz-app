import type { Answer, Question, QuizMeta } from "./types";

// ─── Chalk palette ────────────────────────────────────────────────────────────

export const C = {
  bg:          "#f5f4f0",
  surface:     "#ffffff",
  surfaceHigh: "#f0eeea",
  border:      "#e5e2db",
  text:        "#1c1a17",
  muted:       "#8a8479",
  primary:     "#5b6af5",
  primaryDim:  "#eef0fe",
  primaryMid:  "#c8cdfa",
  success:     "#27ae74",
  successDim:  "#e8f8f0",
  danger:      "#e05252",
  dangerDim:   "#fef0f0",
  amber:       "#f5a623",
  amberDim:    "#fef6e7",
  purple:      "#9b59b6",
  purpleDim:   "#f5eefa",
} as const;

export type Palette = typeof C;

// ─── Google Fonts URL ─────────────────────────────────────────────────────────

export const FONTS_URL =
  "https://fonts.googleapis.com/css2?family=Nunito:wght@600;700;800;900&family=Nunito+Sans:wght@300;400;500;600&display=swap";

// ─── Global CSS injected once ─────────────────────────────────────────────────

export const GLOBAL_CSS = `
  @import url('${FONTS_URL}');
  *, *::before, *::after { box-sizing: border-box; }
  @keyframes spin    { to { transform: rotate(360deg); } }
  @keyframes pulse   { 0%,100%{ opacity:1 } 50%{ opacity:.4 } }
  @keyframes fadeIn  { from { opacity:0; transform:translateY(6px); } to { opacity:1; transform:translateY(0); } }
  @keyframes dropPulse {
    0%   { box-shadow: 0 0 0 0   rgba(91,106,245,.35); }
    100% { box-shadow: 0 0 0 8px rgba(91,106,245,0);   }
  }
  .q-anim { animation: fadeIn .22s ease-out; }
  input:focus, select:focus, textarea:focus { outline: none; }
  input[type=number]::-webkit-inner-spin-button { opacity: 1; }
  .dnd-overlay { pointer-events: none; }
`;

// ─── Unique id helper ─────────────────────────────────────────────────────────

export const uid = (): string => Math.random().toString(36).slice(2, 8);

// ─── Factory functions ────────────────────────────────────────────────────────

export const makeAnswer = (overrides: Partial<Answer> = {}): Answer => ({
  id:      uid(),
  text:    "",
  correct: false,
  ...overrides,
});

export const makeQuestion = (): Question => ({
  id:          uid(),
  text:        "",
  explanation: "",
  points:      1,
  answers: [
    makeAnswer(),
    makeAnswer(),
    makeAnswer(),
    makeAnswer(),
  ],
});

export const makeDefaultMeta = (): QuizMeta => ({
  title:    "",
  category: "",
  time:     "",
  passing:  60,
  shuffle:  false,
  attempts: "Неограничено",
});

// ─── Category list ────────────────────────────────────────────────────────────

export const CATEGORIES: string[] = [
  "Информатика",
  "Математика",
  "Физика",
  "Базы данных",
  "Алгоритмы",
  "Сети",
  "Другое",
];

export const ATTEMPTS_OPTIONS: string[] = [
  "Неограничено",
  "1 попытка",
  "2 попытки",
  "3 попытки",
];