import { Router } from "express";
import {
  getRecentAttempts,
  getAttemptDetails,
  getQuizAttemptsList,
} from "./getAttempts.controller.js";
import { authMiddleware } from "../../middlewares/authMiddleware.js";
import { requireRole } from "../../middlewares/requireRole.js";

const router = Router();

router.get("/recent-attempts", authMiddleware, requireRole("TEACHER"), getRecentAttempts);
router.get("/student-attempt/:attemptId", authMiddleware, requireRole("TEACHER"), getAttemptDetails);
router.get("/quizzes/:quizId/attempts", authMiddleware, requireRole("TEACHER"), getQuizAttemptsList);

export default router;
