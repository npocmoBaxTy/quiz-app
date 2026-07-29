import { Router } from "express";
import { generateQuestions } from "./generateAI.controller.js";
import { authMiddleware } from "../../middlewares/authMiddleware.js";
import { requireRole } from "../../middlewares/requireRole.js";

const router = Router();

router.post("/generate-questions", authMiddleware, requireRole("TEACHER"), generateQuestions);

export default router;