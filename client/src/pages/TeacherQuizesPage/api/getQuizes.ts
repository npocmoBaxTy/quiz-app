import { api } from "@/shared/api/axios";
import type { Quiz } from "../types";

export async function getQuizzesRequest() {
  const res = await api.get<Quiz[]>("/api/quizes/list");
  return res.data;
}
