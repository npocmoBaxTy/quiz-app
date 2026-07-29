import { Router } from "express";
import { getQuizById } from "./getQuizById.controller.js";
import { authMiddleware } from "../../middlewares/authMiddleware.js";

const router = Router();

router.get("/:quizId", authMiddleware, getQuizById);

export default router;
