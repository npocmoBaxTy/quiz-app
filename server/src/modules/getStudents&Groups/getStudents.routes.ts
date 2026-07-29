import { Router } from "express";
import { getAssignableUsers, createGroup, updateStudent } from "./getStudents.controller.js";
import { authMiddleware } from "../../middlewares/authMiddleware.js";
import { requireRole } from "../../middlewares/requireRole.js";

const router = Router();

router.get(
  "/assignable-users",
  authMiddleware,
  requireRole("TEACHER"),
  getAssignableUsers,
);

router.post(
  "/groups",
  authMiddleware,
  requireRole("TEACHER"),
  createGroup,
);

router.patch(
  "/students/:studentId",
  authMiddleware,
  requireRole("TEACHER"),
  updateStudent,
);

export default router;
