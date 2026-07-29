import { useEffect, useMemo, useState } from "react";
import type { IUser } from "@/features/auth/FormContext/FormContext";
import { AuthContext } from "./AuthContext";
import { api } from "@/shared/api/axios";
import { useAuthStore } from "@/features/auth/store/authstore";
import { router } from "./../router/router";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const login = useAuthStore((s) => s.login);
  const logoutStore = useAuthStore((s) => s.logout);

  // logout
  async function logout() {
    try {
      await api.post("/api/auth/logout");
    } finally {
      logoutStore();
      router.navigate("/user/login");
    }
  }

  // проверка авторизации
  async function refreshAuth() {
    try {
      const res = await api.get<IUser>("/api/auth/me");
      login(res.data); // ✔ только user
    } catch {
      logoutStore();
    }
  }

  useEffect(() => {
    const init = async () => {
      try {
        await refreshAuth();
      } finally {
        setIsLoading(false);
      }
    };

    init();
  }, []);

  const value = useMemo(
    () => ({
      isLoading,
      refreshAuth,
      logout,
    }),
    [isLoading, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
