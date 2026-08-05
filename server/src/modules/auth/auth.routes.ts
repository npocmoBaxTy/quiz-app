import { Router } from "express";
import {
  registerController,
  loginController,
  meController,
  refreshController,
  logoutController,
  groupsController,
} from "./auth.controller.js";
import { authMiddleware } from "../../middlewares/authMiddleware.js";
import {
  loginLimiter,
  registerLimiter,
  refreshLimiter,
} from "../../middlewares/rateLimit.js";

const router = Router();

router.get("/groups", groupsController);
router.post("/register", registerLimiter, registerController);
router.post("/login", loginLimiter, loginController);
router.post("/refresh", refreshLimiter, refreshController);
router.post("/logout", logoutController);
router.get("/me", authMiddleware, meController);

export default router;
