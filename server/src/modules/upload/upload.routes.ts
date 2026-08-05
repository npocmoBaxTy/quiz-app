import { Router, Request, Response, NextFunction } from "express";
import multer from "multer";
import { uploadImageHandler } from "./upload.controller.js";
import { requireRole } from "../../middlewares/requireRole.js";
import { uploadImage } from "../../middlewares/upload.js";

const router = Router();

function handleUpload(req: Request, res: Response, next: NextFunction) {
  uploadImage.single("image")(req, res, (err: unknown) => {
    if (err instanceof multer.MulterError) {
      res.status(400).json({ error: "Файл слишком большой (макс. 5 МБ)" });
      return;
    }
    if (err) {
      res.status(400).json({
        error: err instanceof Error ? err.message : "Не удалось загрузить файл",
      });
      return;
    }
    next();
  });
}

router.post("/image", requireRole("TEACHER", "STUDENT"), handleUpload, uploadImageHandler);

export default router;
