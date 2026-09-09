// Ваш настроенный axios

import { api } from "@/shared/api/axios";

export interface DocumentCategory {
  id: number;
  name: string;
  createdAt: string;
}

export interface StudyDocument {
  id: number;
  title: string;
  fileUrl: string;
  categoryId: number;
  category?: DocumentCategory;
  createdAt: string;
}

export const studyService = {
  // --- Категории ---
  getCategories: async () => {
    const response = await api.get<{
      success: boolean;
      data: DocumentCategory[];
    }>("/api/study-categories");
    return response.data;
  },

  createCategory: async (name: string) => {
    const response = await api.post<{
      success: boolean;
      data: DocumentCategory;
    }>("/api/study-categories", { name });
    return response.data;
  },

  deleteCategory: async (id: number) => {
    const response = await api.delete(`/api/study-categories/${id}`);
    return response.data;
  },

  // --- Учебные документы ---
  getDocuments: async (categoryId?: number) => {
    const params = categoryId ? { categoryId } : {};
    const response = await api.get<{ success: boolean; data: StudyDocument[] }>(
      "/api/study-documents",
      { params },
    );
    return response.data;
  },

  createDocument: async (formData: FormData) => {
    const response = await api.post<{ success: boolean; data: StudyDocument }>(
      "/api/study-documents",
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      },
    );
    return response.data;
  },

  deleteDocument: async (id: number) => {
    const response = await api.delete(`/api/study-documents/${id}`);
    return response.data;
  },
};
