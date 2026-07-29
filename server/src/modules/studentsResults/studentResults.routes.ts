import { Router } from "express";
import {
  getStudentResults,
  getAttemptDetailsById,
} from "./studentResults.controller.js";
import { authMiddleware } from "../../middlewares/authMiddleware.js";
import { requireRole } from "../../middlewares/requireRole.js";

const router = Router();

router.get(
  "/results",
  authMiddleware,
  requireRole("STUDENT"),
  getStudentResults,
);

router.get(
  "/attempt/:attemptId",
  authMiddleware,
  requireRole("STUDENT"),
  getAttemptDetailsById,
);

export default router;
