import type { Answer } from "../types";

/**
 * Вариант ответа считается заполненным, если в нём есть текст ИЛИ картинка —
 * вопрос может состоять только из изображений, и это нормальный случай.
 */
const isAnswerFilled = (a: Answer) => !!a.text?.trim() || !!a.imageUrl;

/**
 * Готовность вопроса — та самая индикация «зелёный/красный» в шапке карточки
 * и в списке вопросов. Логика одна на оба места, чтобы они не разъезжались.
 */
export function isQuestionReady({
  questionText,
  questionType,
  answers,
}: {
  questionText?: string;
  questionType?: string;
  answers: Answer[];
}): boolean {
  // 1. Текст вопроса обязателен
  if (!questionText?.trim()) return false;

  // 2. Если тип текстовый (эссе) — больше ничего не нужно
  if (questionType === "text") return true;

  // 3. Проверки для тестовых вопросов
  const hasMinAnswers = answers.length >= 2;
  const allAnswersFilled = answers.every(isAnswerFilled);
  const correctCount = answers.filter((a) => a.isCorrect).length;

  if (questionType === "single") {
    return hasMinAnswers && allAnswersFilled && correctCount === 1;
  }

  if (questionType === "multiple") {
    return hasMinAnswers && allAnswersFilled && correctCount >= 1;
  }

  return false;
}
