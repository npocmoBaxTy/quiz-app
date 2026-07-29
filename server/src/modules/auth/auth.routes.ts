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

const router = Router();

router.get("/groups", groupsController);
router.post("/register", registerController);
router.post("/login", loginController);
router.post("/refresh", refreshController);
router.post("/logout", logoutController);
router.get("/me", authMiddleware, meController);

export default router;
