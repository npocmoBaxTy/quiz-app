import { Router } from "express";
import {
  getAllCategories,
  createCategory,
  deleteCategory,
} from "./categorise.controller.js";
import { authMiddleware } from "../../middlewares/authMiddleware.js";
import { requireRole } from "../../middlewares/requireRole.js";

const router = Router();

// Получить список категорий (доступно авторизованным пользователям)
router.get("/", authMiddleware, getAllCategories);

// Создать категорию (только TEACHER и ADMIN)
router.post("/", authMiddleware, requireRole("TEACHER"), createCategory);

// Удалить категорию (только TEACHER и ADMIN)
router.delete("/:id", authMiddleware, requireRole("TEACHER"), deleteCategory);

export default router;
