import { api } from "@/shared/api/axios";

export async function uploadQuizImage(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("image", file);

  const res = await api.post<{ success: true; url: string }>(
    "/api/upload/image",
    formData,
    { headers: { "Content-Type": "multipart/form-data" } },
  );

  return res.data.url;
}
