import { Router } from "express";
import {
  getProfileController,
  updateProfileController,
  changePasswordController,
} from "./profile.controller.js";
import { authMiddleware } from "../../middlewares/authMiddleware.js";

const router = Router();

router.get("/", authMiddleware, getProfileController);
router.patch("/", authMiddleware, updateProfileController);
router.post("/change-password", authMiddleware, changePasswordController);

export default router;
