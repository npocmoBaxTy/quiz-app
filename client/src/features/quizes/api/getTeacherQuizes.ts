import { api } from "@/shared/api/axios";

export async function getTeacherQuizes() {
  const res = await api.get("api/quizes/teacher");
  return res.data;
}
