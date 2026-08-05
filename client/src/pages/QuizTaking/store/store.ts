import { create } from "zustand";
import type { Question, TakingQuiz } from "../types";
import { AxiosError } from "axios";
import { persist } from "zustand/middleware";

interface TestStore {
  // Данные теста
  questions: Question[];
  quiz: TakingQuiz;
  answers: Record<string, string[]>;
  currentIndex: number;

  // Данные попытки (результаты)
  isSubmitting: boolean;
  submitError: string | null;
  score: number | null;
  attemptId: string | null;
  maxScore: number | null;
  setMaxScore: (maxScore: number) => void;

  // Инициализация
  setQuestions: (questions: Question[]) => void;
  setQuiz: (quiz: TakingQuiz) => void;
  setScore: (score: number) => void;
  setIsSubmitting: (val: boolean) => void;

  // Работа с ответами
  setSingleAnswer: (qId: string, optionId: string) => void;
  toggleMultipleAnswer: (qId: string, optionId: string) => void;
  setTextAnswer: (qId: string, text: string) => void;

  // Навигация
  next: () => void;
  prev: () => void;
  goToIndex: (index: number) => void;

  // Пометка вопросов "на подумать"
  flagged: Record<string, boolean>;
  toggleFlag: (qId: string) => void;

  // Утилиты
  getAnsweredCount: () => number;
  getProgress: () => number;

  // Взаимодействие с API
  setAttemptId: (id: string) => void;
  reset: () => void;

  // Прокторинг
  violations: number;
  lastViolationTime: number;
  maxViolations: number;
  isLocked: boolean;
  lockReason: string | null;
  incrementViolation: () => void;
  /**
   * Блокирует тест и передаёт отправку единственному обработчику —
   * useEffect по isLocked в QuizTaking. Второй точки сабмита быть не должно.
   */
  lockTest: (reason: string) => void;
}

// Вспомогательная функция для честного перемешивания массива
export function shuffleArray<T>(array: T[]): T[] {
  const newArray = [...array]; // Создаем копию, чтобы не мутировать оригинал
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

export const useTestStore = create<TestStore>()(
  persist(
    (set, get) => ({
      questions: [],
      quiz: {} as TakingQuiz,
      answers: {},
      currentIndex: 0,
      flagged: {},

      isSubmitting: false,
      submitError: null,
      score: null,
      maxScore: 50,
      attemptId: null,

      setMaxScore: (maxScore) => set({ maxScore }),

      setQuiz: (quiz) => set({ quiz }),
      setAttemptId: (attemptId) => set({ attemptId }),

      // Обычная загрузка вопросов без перемешивания
      setQuestions: (questions) =>
        set({
          questions,
          answers: {},
          currentIndex: 0,
          flagged: {},
          score: null,
          attemptId: null,
        }),

      setScore: (score) => set({ score }),
      setIsSubmitting: (isSubmitting) => set({ isSubmitting }),

      // Добавлено для корректной работы обработки ошибок в компоненте QuizTaking
      setSubmitError: (error: AxiosError) =>
        set({ submitError: error.message }),

      setSingleAnswer: (qId, optionId) =>
        set((state) => ({
          answers: {
            ...state.answers,
            [qId]: [optionId],
          },
        })),

      toggleMultipleAnswer: (qId, optionId) =>
        set((state) => {
          const current = state.answers[qId] || [];
          const exists = current.includes(optionId);

          const newAnswers = exists
            ? current.filter((id) => id !== optionId)
            : [...current, optionId];

          const nextAnswers = { ...state.answers };
          if (newAnswers.length === 0) {
            delete nextAnswers[qId]; // Очищаем пустые массивы
          } else {
            nextAnswers[qId] = newAnswers;
          }

          return { answers: nextAnswers };
        }),

      setTextAnswer: (qId, text) =>
        set((state) => {
          const nextAnswers = { ...state.answers };
          if (text.trim() === "") {
            delete nextAnswers[qId]; // Удаляем, если стерли текст
          } else {
            nextAnswers[qId] = [text];
          }
          return { answers: nextAnswers };
        }),

      next: () =>
        set((state) => ({
          currentIndex: Math.min(
            state.currentIndex + 1,
            state.questions.length - 1,
          ),
        })),

      prev: () =>
        set((state) => ({
          currentIndex: Math.max(state.currentIndex - 1, 0),
        })),

      goToIndex: (index) =>
        set((state) => ({
          currentIndex: Math.min(
            Math.max(index, 0),
            Math.max(state.questions.length - 1, 0),
          ),
        })),

      toggleFlag: (qId) =>
        set((state) => ({
          flagged: { ...state.flagged, [qId]: !state.flagged[qId] },
        })),

      getAnsweredCount: () => Object.keys(get().answers).length,

      getProgress: () => {
        const { questions } = get();
        const answeredCount = get().getAnsweredCount();
        return questions.length === 0
          ? 0
          : Math.round((answeredCount / questions.length) * 100);
      },

      reset: () =>
        set({
          questions: [],
          answers: {},
          currentIndex: 0,
          flagged: {},
          isSubmitting: false,
          submitError: null,
          score: null,
          maxScore: null,
          attemptId: null,
          violations: 0,
          lastViolationTime: 0,
          isLocked: false,
          lockReason: null,
        }),

      // Переменные для прокторинга
      violations: 0,
      lastViolationTime: 0,
      maxViolations: 3,
      isLocked: false,
      lockReason: null as string | null,

      lockTest: (reason) => {
        if (get().isLocked) return; // Первая причина блокировки и остаётся
        set({ isLocked: true, lockReason: reason });
      },

      incrementViolation: () => {
        const { violations, maxViolations, isLocked } = get();
        if (isLocked) return; // Если уже заблокировано, ничего не делаем

        const now = Date.now();
        if (now - get().lastViolationTime < 2000) return;

        const newViolations = violations + 1;
        set({ violations: newViolations, lastViolationTime: now });

        if (newViolations >= maxViolations) {
          // Мгновенно блокируем интерфейс, всю логику отправки на сервер берет на себя useEffect в QuizTaking
          get().lockTest("limit_exceeded");
        }
      },
    }),
    {
      name: "edueval-test-storage", // Имя ключа в localStorage
      partialize: (state) => ({
        answers: state.answers,
        attemptId: state.attemptId,
        flagged: state.flagged,
      }), // Сохраняем ТОЛЬКО ответы, флаги и ID попытки для устойчивости к крашам
    },
  ),
);
