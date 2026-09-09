import { Request, Response } from "express";
import fs from "fs";
import path from "path";
import { prisma } from "../../db/prisma.js";

// Вспомогательная функция для удаления файла
const deleteFile = (fileUrl: string) => {
  // Настройте путь в зависимости от вашей структуры папок.
  // Пример: если fileUrl = '/uploads/docs/file.pdf', мы ищем его в корне проекта
  const filePath = path.join(__dirname, "..", fileUrl);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
};

export const getAllStudyDocuments = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const categoryId = req.query.categoryId
      ? parseInt(req.query.categoryId as string, 10)
      : undefined;

    // Динамически формируем параметры запроса для Prisma
    const queryOptions: any = {
      include: { category: true },
      orderBy: { createdAt: "desc" },
    };

    // Добавляем условие where ТОЛЬКО если categoryId реально существует и это число
    if (categoryId && !isNaN(categoryId)) {
      queryOptions.where = { categoryId };
    }

    const documents = await prisma.studyDocument.findMany(queryOptions);

    res.status(200).json({ success: true, data: documents });
  } catch (error) {
    console.error("Hujjatlarni yuklashda xatolik:", error);
    res
      .status(500)
      .json({ success: false, message: "Hujjatlarni yuklashda xatolik" });
  }
};

export const createStudyDocument = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const file = req.file as Express.Multer.File | undefined;

  try {
    const { title, categoryId } = req.body;

    if (!title || !categoryId || !file) {
      // Если забыли передать данные, но файл уже загрузился - удаляем его
      if (file) deleteFile(`/uploads/documents/${file.filename}`);

      res.status(400).json({
        success: false,
        message: "Barcha maydonlarni to'ldiring va fayl yuklang!",
      });
      return;
    }

    const fileUrl = `/uploads/documents/${file.filename}`;

    // Пытаемся записать в БД
    const newDocument = await prisma.studyDocument.create({
      data: {
        title: title.trim(),
        categoryId: parseInt(categoryId),
        fileUrl: fileUrl,
      },
    });

    res.status(201).json({ success: true, data: newDocument });
  } catch (error) {
    console.error("Xatolik:", error);

    // ГЛАВНАЯ ЗАЩИТА: Если БД упала (например, нет такой категории), удаляем файл
    if (file) {
      deleteFile(`/uploads/documents/${file.filename}`);
    }

    res.status(500).json({
      success: false,
      message: "Hujjatni saqlashda xatolik yuz berdi",
    });
  }
};

export const deleteStudyDocument = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const rawId = req.params.id;
    if (!rawId || typeof rawId !== "string") {
      res.status(400).json({ success: false, message: "Yaroqsiz ID" });
      return;
    }

    const id = parseInt(rawId, 10);
    if (isNaN(id)) {
      res.status(400).json({ success: false, message: "Yaroqsiz ID formati" });
      return;
    }

    // 1. Находим документ, чтобы получить fileUrl
    const existingDoc = await prisma.studyDocument.findUnique({
      where: { id },
    });

    if (!existingDoc) {
      res.status(404).json({ success: false, message: "Hujjat topilmadi" });
      return;
    }

    // 2. Удаляем запись из базы данных (СНАЧАЛА БД)
    await prisma.studyDocument.delete({ where: { id } });

    // 3. Если БД успешно удалила запись, удаляем файл с диска (ПОТОМ ФАЙЛ)
    deleteFile(existingDoc.fileUrl);

    res
      .status(200)
      .json({ success: true, message: "Hujjat muvaffaqiyatli o'chirildi" });
  } catch (error) {
    console.error("O'chirishda xatolik:", error);
    res.status(500).json({
      success: false,
      message: "Hujjatni o'chirishda xatolik yuz berdi",
    });
  }
};
