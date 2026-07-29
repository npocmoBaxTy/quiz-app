import { Router } from "express";
import { getQuizzes } from "./quizes.controler.js";
import { authMiddleware } from "../../middlewares/authMiddleware.js";
import { requireRole } from "../../middlewares/requireRole.js";

const router = Router();

router.get("/list", authMiddleware, requireRole("TEACHER"), getQuizzes);

export default router;
