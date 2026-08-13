import { Router } from "express";
import {
  getProfileController,
  updateProfileController,
  changePasswordController,
} from "./profile.controller.js";
import { authMiddleware } from "../../middlewares/authMiddleware.js";
import { passwordChangeLimiter } from "../../middlewares/rateLimit.js";

const router = Router();

router.get("/", authMiddleware, getProfileController);
router.patch("/", authMiddleware, updateProfileController);
// Лимитер после authMiddleware: ему нужен req.user, чтобы считать попытки
// по пользователю, а не по общему IP.
router.post(
  "/change-password",
  authMiddleware,
  passwordChangeLimiter,
  changePasswordController,
);

export default router;
