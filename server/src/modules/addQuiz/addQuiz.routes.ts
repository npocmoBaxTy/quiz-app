import { Router } from "express";
import { createQuiz } from "./addQuiz.controller.js";
import { requireRole } from "../../middlewares/requireRole.js";

const router = Router();

router.post("/", requireRole("TEACHER"), createQuiz);

export default router;
