import { Router } from "express";
import { getQuiz } from "./quizTaking.controller.js";
import { authMiddleware } from "../../middlewares/authMiddleware.js";
import { requireRole } from "../../middlewares/requireRole.js";

const router = Router();

router.get("/:quizId", authMiddleware, requireRole("STUDENT"), getQuiz);

export default router;
