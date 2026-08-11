import fs from "fs";
import path from "path";
import { randomUUID } from "crypto";
import multer from "multer";
import { env } from "../config/env.js";

// Путь считаем от рабочей директории процесса, а не от __dirname: иначе в dev
// (tsx из server/) и в проде (node dist/server.js) получаются разные каталоги.
// Для деплоя этот каталог нужно смонтировать как volume — см. README.
export const UPLOADS_DIR = path.resolve(env.uploadsDir);

if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

const ALLOWED_MIME_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif",
]);

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${randomUUID()}${ext}`);
  },
});

export const uploadImage = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
      cb(new Error("Разрешены только изображения (png, jpeg, webp, gif)"));
      return;
    }
    cb(null, true);
  },
});
