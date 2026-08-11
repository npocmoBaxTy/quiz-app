import { Request, Response } from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { env } from "../../config/env.js";

// Инициализируем Gemini с вашим ключом из .env
const genAI = new GoogleGenerativeAI(env.geminiApiKey);

export const generateQuestions = async (req: Request, res: Response) => {
  try {
    const { topic, difficulty } = req.body;

    // count приходит от клиента и уходит в платный API — ограничиваем,
    // чтобы одним запросом нельзя было заказать тысячи генераций.
    const MAX_QUESTIONS = 20;
    const requestedCount = Number(req.body.count ?? 3);
    const count =
      Number.isFinite(requestedCount) && requestedCount > 0
        ? Math.min(Math.floor(requestedCount), MAX_QUESTIONS)
        : 3;

    if (typeof topic !== "string" || topic.trim().length === 0) {
      return res.status(400).json({ error: "Не указана тема" });
    }

    // Проверяем наличие ключа
    if (!env.geminiApiKey) {
      return res.status(500).json({ error: "API ключ Gemini не настроен на сервере" });
    }

    // Выбираем самую быструю и дешевую модель
    const model = genAI.getGenerativeModel({
      model: "gemini-3-flash-preview",
      generationConfig: {
        // Заставляем ИИ всегда возвращать чистый JSON!
        responseMimeType: "application/json", 
      }
    });

    // Строгий промпт, чтобы ИИ понимал нашу структуру БД
    const prompt = `
      Ты эксперт-преподаватель IT-дисциплин. 
      Сгенерируй ${count} тестовых вопросов по теме "${topic}" уровня "${difficulty}".
      
      Верни массив объектов. Каждый объект должен иметь следующую структуру:
      [
        {
          "text": "Текст вопроса",
          "type": "single",
          "points": 1,
          "options": [
            { "text": "Правильный вариант ответа", "isCorrect": true },
            { "text": "Неправильный вариант 1", "isCorrect": false },
            { "text": "Неправильный вариант 2", "isCorrect": false },
            { "text": "Неправильный вариант 3", "isCorrect": false }
          ]
        }
      ]
      
      Важно: 
      1. Поле type может быть только "single" (один правильный ответ) или "multiple" (несколько правильных).
      2. Для type="single" должен быть ровно ОДИН вариант с isCorrect: true.
      3. Верни ТОЛЬКО JSON-массив, без markdown или дополнительных слов.
    `;

    // Отправляем запрос в Google
    const result = await model.generateContent(prompt);
    const aiResponseText = result.response.text();
    
    // Парсим строку в настоящий JavaScript массив
    const parsedQuestions = JSON.parse(aiResponseText);

    // Отправляем массив на фронтенд
    res.json(parsedQuestions);
    
  } catch (error) {
    console.error("Ошибка при генерации вопросов Gemini:", error);
    res.status(500).json({ error: "Не удалось сгенерировать вопросы. Попробуйте еще раз." });
  }
};