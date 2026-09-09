import { Request, Response } from "express";
import fs from "fs";
import path from "path";
import { prisma } from "../../db/prisma.js";

export const getAllCategories = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const categories = await prisma.documentCategory.findMany({
      orderBy: { createdAt: "desc" },
    });
    res.status(200).json({ success: true, data: categories });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Kategoriyalarni yuklashda xatolik" });
  }
};

export const createCategory = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { name } = req.body;
    if (!name) {
      res.status(400).json({
        success: false,
        message: "Kategoriya nomi kiritilishi shart!",
      });
      return;
    }
    const category = await prisma.documentCategory.create({ data: { name } });
    res.status(201).json({ success: true, data: category });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Kategoriya yaratishda xatolik" });
  }
};

export const deleteCategory = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    // Явно проверяем и берем строку ID
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

    // 1. Находим все документы в этой категории
    const category = await prisma.documentCategory.findUnique({
      where: { id },
      include: { documents: true },
    });

    if (!category) {
      res.status(404).json({ success: false, message: "Kategoriya topilmadi" });
      return;
    }

    // 2. Удаляем категорию из БД
    await prisma.documentCategory.delete({ where: { id } });

    // 3. Удаляем физические файлы с диска
    for (const doc of category.documents) {
      const filePath = path.join(__dirname, "..", doc.fileUrl);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    res.status(200).json({
      success: true,
      message: "Kategoriya va unga tegishli hujjatlar o'chirildi",
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Kategoriyani o'chirishda xatolik" });
  }
};
