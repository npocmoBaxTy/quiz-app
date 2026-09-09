import { useState, useEffect, useCallback } from "react";
import { toast } from "react-hot-toast";
import {
  studyService,
  type DocumentCategory,
  type StudyDocument,
} from "../services/resources.service.ts";

export function useStudyDocs() {
  const [categories, setCategories] = useState<DocumentCategory[]>([]);
  const [documents, setDocuments] = useState<StudyDocument[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<
    number | undefined
  >(undefined);

  const [isLoadingCategories, setIsLoadingCategories] = useState(false);
  const [isLoadingDocuments, setIsLoadingDocuments] = useState(false);

  // 1. Загрузка категорий
  const fetchCategories = useCallback(async () => {
    try {
      setIsLoadingCategories(true);
      const res = await studyService.getCategories();
      setCategories(res.data);
    } catch (error) {
      toast.error("Kategoriyalarni yuklashda xatolik");
      console.error(error);
    } finally {
      setIsLoadingCategories(false);
    }
  }, []);

  // 2. Загрузка документов (с учетом выбранной категории)
  const fetchDocuments = useCallback(async (catId?: number) => {
    try {
      setIsLoadingDocuments(true);
      const res = await studyService.getDocuments(catId);
      setDocuments(res.data);
    } catch (error) {
      toast.error("Hujjatlarni yuklashda xatolik");
      console.error(error);
    } finally {
      setIsLoadingDocuments(false);
    }
  }, []);

  // Первичная загрузка
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // Перезагрузка документов при смене выбранного таба (категории)
  useEffect(() => {
    fetchDocuments(selectedCategoryId);
  }, [selectedCategoryId, fetchDocuments]);

  // --- Действия (Actions) ---

  const handleCreateCategory = async (name: string) => {
    try {
      await studyService.createCategory(name);
      toast.success("Kategoriya yaratildi!");
      fetchCategories();
    } catch (error) {
      toast.error("Kategoriya yaratishda xatolik");
      throw error;
    }
  };

  const handleDeleteCategory = async (id: number) => {
    if (
      !window.confirm(
        "Rostdan ham bu kategoriyani va uning ichidagi barcha hujjatlarni o'chirmoqchimisiz?",
      )
    )
      return;
    try {
      await studyService.deleteCategory(id);
      toast.success("Kategoriya o'chirildi");
      if (selectedCategoryId === id) setSelectedCategoryId(undefined);
      fetchCategories();
      fetchDocuments(selectedCategoryId);
    } catch (error) {
      toast.error("O'chirishda xatolik");
      console.error(error);
    }
  };

  const handleCreateDocument = async (formData: FormData) => {
    try {
      await studyService.createDocument(formData);
      toast.success("Hujjat muvaffaqiyatli yuklandi!");
      fetchDocuments(selectedCategoryId);
    } catch (error) {
      toast.error("Hujjatni yuklashda xatolik");
      throw error;
    }
  };

  const handleDeleteDocument = async (id: number) => {
    if (!window.confirm("Hujjatni o'chirishni tasdiqlaysizmi?")) return;
    try {
      await studyService.deleteDocument(id);
      toast.success("Hujjat o'chirildi");
      fetchDocuments(selectedCategoryId);
    } catch (error) {
      toast.error("O'chirishda xatolik");
      console.error(error);
    }
  };

  return {
    categories,
    documents,
    selectedCategoryId,
    setSelectedCategoryId,
    isLoadingCategories,
    isLoadingDocuments,
    handleCreateCategory,
    handleDeleteCategory,
    handleCreateDocument,
    handleDeleteDocument,
    refreshDocuments: () => fetchDocuments(selectedCategoryId),
  };
}
