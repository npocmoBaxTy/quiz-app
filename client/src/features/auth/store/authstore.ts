import { create } from "zustand";
import { persist } from "zustand/middleware";

interface User {
  full_name: string;
  role: string;
  email: string;
  group?: string;
  avatar_url?: string | null;
  id: string;
}

interface AuthState {
  user: User | null;
  login: (user: User) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,

      login: (user) => {
        set({ user });
      },

      logout: () => {
        set({ user: null });
        localStorage.removeItem("auth-storage");
      },
    }),
    {
      name: "auth-storage",
    },
  ),
);
