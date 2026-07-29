import { useState } from "react";
import axios from "axios";
import { api } from "@/shared/api/axios";

export function useRegisterUser() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const register = async (data: {
    name: string;
    password: string;
    groupId: string;
    email: string;
  }) => {
    try {
      setIsLoading(true);
      setError(null);
      setSuccess(false);

      const res = await api.post("/api/auth/register", data, {
        withCredentials: true,
      });

      setSuccess(true);
      return res.data;
    } catch (e: unknown) {
      // Используем unknown вместо any для безопасности
      if (axios.isAxiosError(e)) {
        // TS теперь знает, что у 'e' есть свойство response
        setError(e.response?.data?.error || "Registration failed");
      } else if (e instanceof Error) {
        // Для обычных ошибок JS (например, Error("..."))
        setError(e.message);
      } else {
        setError("An unexpected error occurred");
      }

      throw e;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    register,
    isLoading,
    error,
    success,
  };
}
