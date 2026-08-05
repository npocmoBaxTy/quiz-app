import { prisma } from "../../db/prisma.js";
import { type Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";

export const getAssignableUsers = async (req: Request, res: Response) => {
  try {
    // 1. Получаем список всех групп
    const groups = await prisma.groups.findMany({
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    });

    // 2. Идем от пользователей, а не от group_students: иначе студент без группы
    // (например, если преподаватель убрал у него группу) пропадал бы из списка
    // навсегда и его нельзя было бы отредактировать.
    const studentRows = await prisma.users.findMany({
      where: { role: "STUDENT" },
      orderBy: { full_name: "asc" },
      select: {
        id: true,
        full_name: true,
        email: true,
        group_students: {
          take: 1,
          select: { groups: { select: { id: true, name: true } } },
        },
      },
    });

    const students = studentRows.map((student) => {
      const group = student.group_students[0]?.groups ?? null;
      return {
        id: student.id,
        full_name: student.full_name,
        email: student.email,
        groupId: group?.id ?? null,
        groupName: group?.name ?? null,
      };
    });

    // 3. Отдаем готовый JSON в том формате, который ждет фронтенд
    res.json({ groups, students });
  } catch (error: any) {
    console.error("Ошибка при получении списков:", error.message);
    res.status(500).json({ error: "Не удалось загрузить список студентов" });
  }
};

export const createGroup = async (req: Request, res: Response) => {
  try {
    const { name } = req.body;
    if (!name || typeof name !== "string" || !name.trim()) {
      return res.status(400).json({ error: "Название группы обязательно" });
    }

    const group = await prisma.groups.create({
      data: { id: uuidv4(), name: name.trim(), created_at: new Date() },
    });

    res.status(201).json(group);
  } catch (error: any) {
    console.error("Ошибка при создании группы:", error.message);
    res.status(500).json({ error: "Не удалось создать группу" });
  }
};

export const updateStudent = async (req: Request, res: Response) => {
  try {
    const studentId = req.params.studentId as string;
    const { full_name, email, groupId } = req.body;

    const student = await prisma.users.findFirst({
      where: { id: studentId, role: "STUDENT" },
      select: { id: true },
    });
    if (!student) {
      return res.status(404).json({ error: "Студент не найден" });
    }

    const updated = await prisma.$transaction(async (tx) => {
      const user = await tx.users.update({
        where: { id: studentId },
        data: {
          ...(full_name !== undefined ? { full_name } : {}),
          ...(email !== undefined ? { email } : {}),
        },
        select: { id: true, full_name: true, email: true, role: true },
      });

      if (groupId !== undefined) {
        await tx.group_students.deleteMany({ where: { student_id: studentId } });
        if (groupId) {
          await tx.group_students.create({
            data: { group_id: groupId, student_id: studentId },
          });
        }
      }

      return user;
    });

    res.json(updated);
  } catch (error: any) {
    console.error("Ошибка при редактировании студента:", error.message);
    res.status(500).json({ error: "Не удалось обновить данные студента" });
  }
};
