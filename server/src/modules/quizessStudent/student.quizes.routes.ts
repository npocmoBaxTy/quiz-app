import { Router } from "express";
import { getQuizesList } from "./student.quizes.controller.js";
import { authMiddleware } from "../../middlewares/authMiddleware.js";
import { requireRole } from "../../middlewares/requireRole.js";

const router = Router();

router.get(
  "/student-list",
  authMiddleware,
  requireRole("STUDENT"),
  getQuizesList,
);

export default router;
