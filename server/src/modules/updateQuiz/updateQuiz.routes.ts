import { Router } from "express";
import { updateQuiz, getQuizForEdit, deleteQuiz } from "./updateQuiz.controller.js";
import { authMiddleware } from "../../middlewares/authMiddleware.js";
import { requireRole } from "../../middlewares/requireRole.js";

const router = Router();

router.get(
  "/quizzes/:quizId/edit",
  authMiddleware,
  requireRole("TEACHER"),
  getQuizForEdit,
);

// 2. ОБНОВИТЬ данные (PUT)
router.put(
  "/quizzes/:quizId",
  authMiddleware,
  requireRole("TEACHER"),
  updateQuiz,
);

// 3. УДАЛИТЬ тест
router.delete(
  "/quizzes/:quizId",
  authMiddleware,
  requireRole("TEACHER"),
  deleteQuiz,
);

export default router;
