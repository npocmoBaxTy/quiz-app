import { type UseFormReturn } from "react-hook-form";
import { type Answer, type QuizFormValues } from "./../types";

export const useQuizFormActions = (form: UseFormReturn<QuizFormValues>) => {
  const { setValue, getValues } = form;

  // 1. Добавили параметр questionType
  const setCorrectAnswer = (
    qIndex: number,
    aIndex: number,
    questionType: "single" | "multiple" | "text",
  ) => {
    const answers = getValues(`questions.${qIndex}.answers`) || [];

    const updatedAnswers = answers.map(
      (ans: { text: string; isCorrect: boolean }, i: number) => {
        // Если это множественный выбор (чекбоксы) - просто переключаем (toggle)
        if (questionType === "multiple") {
          return i === aIndex ? { ...ans, isCorrect: !ans.isCorrect } : ans;
        }
        // Если это одиночный выбор (радиокнопки) - только один может быть true
        return { ...ans, isCorrect: i === aIndex };
      },
    );

    setValue(`questions.${qIndex}.answers`, updatedAnswers, {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  const addAnswer = (qIndex: number) => {
    const answers = getValues(`questions.${qIndex}.answers`) || [];
    setValue(`questions.${qIndex}.answers`, [
      ...answers,
      { text: "", isCorrect: false, imageUrl: "" },
    ]);
  };

  const removeAnswer = (qIndex: number, aIndex: number) => {
    const answers = getValues(`questions.${qIndex}.answers`) || [];
    const updated = answers.filter((_: Answer, i: number) => i !== aIndex);
    setValue(`questions.${qIndex}.answers`, updated);
  };

  // 2. Теперь можно передавать тип при создании вопроса
  const addQuestion = (type: "single" | "multiple" | "text" = "single") => {
    const questions = getValues("questions") || [];

    // Формируем дефолтные ответы в зависимости от типа
    let defaultAnswers = [];
    if (type === "text") {
      // Для текста нужен только один правильный вариант по умолчанию
      defaultAnswers = [{ text: "", isCorrect: true, imageUrl: "" }];
    } else {
      defaultAnswers = [
        { text: "", isCorrect: true, imageUrl: "" },
        { text: "", isCorrect: false, imageUrl: "" },
      ];
    }

    setValue("questions", [
      ...questions,
      {
        text: "",
        points: 2,
        type: type,
        imageUrl: "",
        answers: defaultAnswers,
      },
    ]);
  };

  return {
    setCorrectAnswer,
    addAnswer,
    removeAnswer,
    addQuestion,
  };
};
