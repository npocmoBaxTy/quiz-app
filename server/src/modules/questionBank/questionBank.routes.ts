import { Router } from "express";
import { getQuestionBank } from "./questionBank.controller.js";
import { requireRole } from "../../middlewares/requireRole.js";

const router = Router();

// Банк отдаёт правильные ответы — студенту сюда нельзя.
router.get("/", requireRole("TEACHER"), getQuestionBank);

export default router;
