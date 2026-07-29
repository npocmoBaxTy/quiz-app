import { useAuthStore } from "@/features/auth/store/authstore";
import { Logo } from "@/shared/ui/Logo/Logo";
import { Home, List, Settings, CircleCheck } from "lucide-react";
import { useTranslation } from "react-i18next";
import { NavLink } from "react-router-dom";

export const Sidebar = () => {
  const { t } = useTranslation();
  const { user } = useAuthStore();

  // Универсальная функция для стилизации пунктов меню
  const getNavLinkClass = ({ isActive }: { isActive: boolean }) => {
    return `flex items-center gap-4 px-3 py-3 rounded-xl transition-all ${
      isActive
        ? "text-slate-900 bg-slate-50/80 font-semibold" // Стили активной вкладки
        : "text-slate-500 hover:text-slate-900 hover:bg-slate-50 font-medium" // Стили неактивной вкладки
    }`;
  };

  return (
    <aside className="w-64 min-h-screen bg-white border-r border-slate-200 p-6 hidden lg:flex flex-col fixed left-0 top-0 z-10">
      {/* Логотип */}
      <div className="mb-8 pl-2">
        <Logo />
      </div>

      {/* Навигация */}
      <nav className="flex-1 space-y-2 mt-4">
        <NavLink to="/student/home" className={getNavLinkClass}>
          <Home size={20} className="opacity-80" />
          <span>{t("sidebar.home", "Главная")}</span>
        </NavLink>

        <NavLink to="/student/quizes" className={getNavLinkClass}>
          <List size={20} className="opacity-80" />
          <span>{t("sidebar.myQuizes", "Мои Тесты")}</span>
        </NavLink>

        <NavLink to="/student/performance" className={getNavLinkClass}>
          <CircleCheck size={20} className="opacity-80" />
          <span>{t("sidebar.performance", "Результаты")}</span>
        </NavLink>

        <NavLink to="/student/settings" className={getNavLinkClass}>
          <Settings size={20} className="opacity-80" />
          <span>{t("sidebar.settings", "Настройки")}</span>
        </NavLink>
      </nav>

      {/* Плашка профиля */}
      <div className="mt-auto pt-6">
        <div className="p-4 bg-[#111827] rounded-2xl text-white shadow-md">
          <p className="text-[10px] font-bold text-slate-400 mb-1.5 tracking-wider uppercase">
            Вы вошли как
          </p>
          <p className="font-medium text-sm truncate" title={user?.full_name}>
            {user?.full_name || "Иванов Иван Иванович"}
          </p>
        </div>
      </div>
    </aside>
  );
};
