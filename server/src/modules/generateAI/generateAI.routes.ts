import { Router } from "express";
import { generateQuestions } from "./generateAI.controller.js";
import { authMiddleware } from "../../middlewares/authMiddleware.js";
import { requireRole } from "../../middlewares/requireRole.js";
import { aiLimiter } from "../../middlewares/rateLimit.js";

const router = Router();

router.post(
  "/generate-questions",
  authMiddleware,
  requireRole("TEACHER"),
  aiLimiter,
  generateQuestions,
);

export default router;