import { create } from "zustand";

interface SidebarState {
  isOpen: boolean;
  // Сайдбар есть не на всех страницах (у преподавателя его нет),
  // поэтому шапка показывает бургер только когда он реально отрендерен
  isMounted: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
  setMounted: (value: boolean) => void;
}

export const useSidebarStore = create<SidebarState>((set) => ({
  isOpen: false,
  isMounted: false,

  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
  toggle: () => set((state) => ({ isOpen: !state.isOpen })),
  setMounted: (value) => set({ isMounted: value, isOpen: false }),
}));
