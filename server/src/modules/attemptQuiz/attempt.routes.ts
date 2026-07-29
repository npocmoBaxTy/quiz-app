import { Router } from "express";
import { submitQuizAttempt } from "./attempt.controller.js";
import { authMiddleware } from "../../middlewares/authMiddleware.js";
import { requireRole } from "../../middlewares/requireRole.js";

const router = Router();

router.post(
  "/submit",
  authMiddleware,
  requireRole("STUDENT"),
  submitQuizAttempt,
);

export default router;
