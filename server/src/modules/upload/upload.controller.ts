import { Request, Response } from "express";

export const uploadImageHandler = (req: Request, res: Response) => {
  if (!req.file) {
    res.status(400).json({ error: "Файл не передан" });
    return;
  }

  res.json({ success: true, url: `/uploads/${req.file.filename}` });
};
