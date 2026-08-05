import { z } from "zod";
import i18n from "@/shared/config/i18n/i18n";

const t = (key: string) => i18n.t(key);

// Базовые кирпичики
export const answerSchema = z.object({
  text: z.string().default(""),
  isCorrect: z.boolean().default(false),
  imageUrl: z.string().optional(),
});

export const baseQuestionSchema = z.object({
  text: z.string().default(""),
  points: z.number().min(1).default(1),
  type: z.enum(["single", "multiple", "text"]).default("single"),
  answers: z.array(answerSchema).default([]),
  imageUrl: z.string().optional(),
});

// --- СХЕМА ДЛЯ ЧЕРНОВИКА ---
export const quizDraftSchema = z.object({
  title: z.string().min(1, t("quizBuilder.schema.enterTitleToSave")),
  questions: z.array(baseQuestionSchema),
  published: z.literal(false), // Явно указываем, что это черновик
});

// --- СХЕМА ДЛЯ ПУБЛИКАЦИИ ---
export const strictQuestionSchema = baseQuestionSchema.superRefine((q, ctx) => {
  if (q.type === "text") return;

  if (q.answers.length < 2) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: t("quizBuilder.schema.minTwoAnswers"),
      path: ["answers"],
    });
    return;
  }

  const correctCount = q.answers.filter((a) => a.isCorrect).length;
  if (q.type === "single" && correctCount !== 1) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: t("quizBuilder.schema.selectOneCorrect"),
      path: ["answers"],
    });
  }
  if (q.type === "multiple" && correctCount < 1) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: t("quizBuilder.schema.selectAtLeastOneCorrect"),
      path: ["answers"],
    });
  }
});

export const quizPublishSchema = z.object({
  title: z.string().min(3, t("quizBuilder.schema.titleTooShort")),
  passing: z.number().min(1).max(100),
  published: z.boolean(),
  timeLimit: z.number().min(1).max(300),
  questionsLimit: z.number().min(1, t("quizBuilder.schema.min1Question")),
  questions: z
    .array(strictQuestionSchema)
    .min(1, t("quizBuilder.schema.addAtLeastOneQuestion")),
});

export const baseQuizSchema = z
  .object({
    title: z.string().min(1, t("quizBuilder.schema.enterQuizTitle")),
    passing: z.number().min(1, t("quizBuilder.schema.min1Percent")).max(100, t("quizBuilder.schema.max100Percent")),
    timeLimit: z.number().min(1, t("quizBuilder.schema.specifyTime")),
    published: z.boolean(),
    questionsLimit: z.number().min(1, t("quizBuilder.schema.min1Question")),

    questions: z.array(
      z.object({
        // Убираем .optional(), текст вопроса должен быть обязательным!
        text: z.string().min(1, t("quizBuilder.schema.questionTextRequired")),
        type: z.enum(["single", "multiple", "text"]),
        points: z.number().min(1, t("quizBuilder.schema.min1Point")),
        description: z.string().optional(),
        imageUrl: z.string().optional(),

        answers: z.array(
          z.object({
            // Zod ожидает строго строку, никаких undefined
            id: z.string().optional(),
            text: z.string(),
            isCorrect: z.boolean(),
            imageUrl: z.string().optional(),
          }),
        ),
      }),
    ),
  })
  .refine((data) => data.questionsLimit <= data.questions.length, {
    message: t("quizBuilder.schema.limitExceedsTotal"),
    path: ["questionsLimit"], // Эта ошибка привяжется конкретно к инпуту questionsLimit
  });

// Универсальный тип для формы
export type QuizFormValues = z.infer<typeof baseQuizSchema>;
