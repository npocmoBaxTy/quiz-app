import { Router } from "express";
import {
  getAllStudyDocuments,
  createStudyDocument,
  deleteStudyDocument,
} from "./resources.controller.js";
import { authMiddleware } from "../../middlewares/authMiddleware.js";
import { requireRole } from "../../middlewares/requireRole.js";
// Укажите ваш актуальный путь к мультеру
import { uploadDocs } from "./../../middlewares/upload.js";

const router = Router();

// Получить список документов (с опциональным фильтром ?categoryId=...)
router.get("/", authMiddleware, getAllStudyDocuments);

// Загрузить новый документ (принимаем файл в поле 'file', проверяем роли)
router.post(
  "/",
  authMiddleware,
  requireRole("TEACHER"),
  uploadDocs.single("file"),
  createStudyDocument,
);

// Удалить документ
router.delete(
  "/:id",
  authMiddleware,
  requireRole("TEACHER"),
  deleteStudyDocument,
);

export default router;
