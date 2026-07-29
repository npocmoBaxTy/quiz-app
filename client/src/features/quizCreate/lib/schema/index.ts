import { z } from "zod";

// Базовые кирпичики
export const answerSchema = z.object({
  text: z.string().default(""),
  isCorrect: z.boolean().default(false),
});

export const baseQuestionSchema = z.object({
  text: z.string().default(""),
  points: z.number().min(1).default(1),
  type: z.enum(["single", "multiple", "text"]).default("single"),
  answers: z.array(answerSchema).default([]),
});

// --- СХЕМА ДЛЯ ЧЕРНОВИКА ---
export const quizDraftSchema = z.object({
  title: z.string().min(1, "Введите название для сохранения"),
  questions: z.array(baseQuestionSchema),
  published: z.literal(false), // Явно указываем, что это черновик
});

// --- СХЕМА ДЛЯ ПУБЛИКАЦИИ ---
export const strictQuestionSchema = baseQuestionSchema.superRefine((q, ctx) => {
  if (q.type === "text") return;

  if (q.answers.length < 2) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Нужно минимум 2 варианта ответа",
      path: ["answers"],
    });
    return;
  }

  const correctCount = q.answers.filter((a) => a.isCorrect).length;
  if (q.type === "single" && correctCount !== 1) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Выберите один правильный ответ",
      path: ["answers"],
    });
  }
  if (q.type === "multiple" && correctCount < 1) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Выберите хотя бы один правильный ответ",
      path: ["answers"],
    });
  }
});

export const quizPublishSchema = z.object({
  title: z.string().min(3, "Название слишком короткое"),
  passing: z.number().min(1).max(100),
  published: z.boolean(),
  timeLimit: z.number().min(1).max(300),
  attemptLimit: z.number().min(1).max(10),
  questionsLimit: z.number().min(1, "Минимум 1 вопрос"),
  questions: z
    .array(strictQuestionSchema)
    .min(1, "Добавьте хотя бы один вопрос"),
});

export const baseQuizSchema = z
  .object({
    title: z.string().min(1, "Введите название теста"),
    passing: z.number().min(1, "Минимум 1%").max(100, "Максимум 100%"),
    timeLimit: z.number().min(1, "Укажите время"),
    attemptLimit: z.number().min(1, "Укажите количество попыток"),
    published: z.boolean(),
    assignedGroups: z.array(z.string()).optional(),
    assignedStudents: z.array(z.string()).optional(),
    startDate: z.string().optional().nullable(),
    dueDate: z.string().optional().nullable(),
    questionsLimit: z.number().min(1, "Минимум 1 вопрос"),

    questions: z.array(
      z.object({
        // Убираем .optional(), текст вопроса должен быть обязательным!
        text: z.string().min(1, "Текст вопроса не может быть пустым"),
        type: z.enum(["single", "multiple", "text"]),
        points: z.number().min(1, "Минимум 1 балл"),
        description: z.string().optional(),

        answers: z.array(
          z.object({
            // Zod ожидает строго строку, никаких undefined
            id: z.string().optional(),
            text: z.string(),
            isCorrect: z.boolean(),
          }),
        ),
      }),
    ),
  })
  .refine((data) => data.questionsLimit <= data.questions.length, {
    message: "Лимит не может быть больше общего количества вопросов!",
    path: ["questionsLimit"], // Эта ошибка привяжется конкретно к инпуту questionsLimit
  });

// Универсальный тип для формы
export type QuizFormValues = z.infer<typeof baseQuizSchema>;
