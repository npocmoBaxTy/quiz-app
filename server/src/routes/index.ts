import { Router } from "express";
import TeacherQuizes from "./../modules/quizess/quiz.routes.js";
import authRoutes from "../modules/auth/auth.routes.js";
import createQuizRoutes from "./../modules/addQuiz/addQuiz.routes.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import studentQuizesRoutes from "../modules/quizessStudent/student.quizes.routes.js";
import quizTakingRoute from "./../modules/quizTaking/quizTaking.routes.js";
import getQuizByIdRoute from "./../modules/getQuizById/getQuizById.routes.js";
import submitAttemptRoute from "./../modules/attemptQuiz/attempt.routes.js";
import AttemptsRoutes from "./../modules/getAttempts/getAttempts.routes.js";
import getStudentsRoutes from "../modules/getStudents&Groups/getStudents.routes.js";
import startAttemptRoutes from "../modules/startAttempt/startAttempt.routes.js";
import updateQuizRoutes from "./../modules/updateQuiz/updateQuiz.routes.js";
import aiGenerateRoutes from "./../modules/generateAI/generateAI.routes.js";
import studentResultsRoutes from "./../modules/studentsResults/studentResults.routes.js";
import uploadRoutes from "./../modules/upload/upload.routes.js";
import profileRoutes from "./../modules/profile/profile.routes.js";
import questionBankRoutes from "./../modules/questionBank/questionBank.routes.js";

const router = Router();

router.use("/auth", authRoutes);
router.use("/quizes", TeacherQuizes);
router.use("/create-quiz", authMiddleware, createQuizRoutes);
router.use("/quizes-student", authMiddleware, studentQuizesRoutes);
router.use("/quiz", authMiddleware, quizTakingRoute);
router.use("/get-quiz-by-id", authMiddleware, getQuizByIdRoute);
router.use("/attempt", authMiddleware, startAttemptRoutes);
router.use("/quiz-taking", authMiddleware, submitAttemptRoute);
router.use("/attempts", authMiddleware, AttemptsRoutes);
router.use("/teacher", authMiddleware, getStudentsRoutes);
router.use("/teacher", authMiddleware, updateQuizRoutes);
router.use("/ai", authMiddleware, aiGenerateRoutes);
router.use("/student", authMiddleware, studentResultsRoutes);
router.use("/upload", authMiddleware, uploadRoutes);
router.use("/profile", profileRoutes);
router.use("/question-bank", authMiddleware, questionBankRoutes);

export default router;
