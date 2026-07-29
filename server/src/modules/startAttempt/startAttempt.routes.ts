import { Router } from "express";
import { startQuizAttempt } from "./startAttempt.controller.js";
import { authMiddleware } from "../../middlewares/authMiddleware.js";
import { requireRole } from "../../middlewares/requireRole.js";

const router = Router();

router.post("/start", authMiddleware, requireRole("STUDENT"), startQuizAttempt);

export default router;
