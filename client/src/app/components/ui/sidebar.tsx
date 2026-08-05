import { useAuthStore } from "@/features/auth/store/authstore";
import { useSidebarStore } from "@/shared/store/sidebarStore";
import { Logo } from "@/shared/ui/Logo/Logo";
import { Home, List, Settings, ChartLine, X } from "lucide-react";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { NavLink, useLocation } from "react-router-dom";

export const Sidebar = () => {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const { isOpen, close, setMounted } = useSidebarStore();
  const location = useLocation();

  // Сообщаем шапке, что на этой странице бургер нужен
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, [setMounted]);

  // Переход по ссылке должен закрывать мобильное меню
  useEffect(() => {
    close();
  }, [location.pathname, close]);

  // Пока меню открыто, страница под ним не должна скроллиться
  useEffect(() => {
    if (!isOpen) return;

    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen, close]);

  // Универсальная функция для стилизации пунктов меню
  const getNavLinkClass = ({ isActive }: { isActive: boolean }) => {
    return `flex items-center gap-4 px-3 py-3 rounded-xl transition-all ${isActive
        ? "text-slate-900 bg-slate-50/80 font-semibold" // Стили активной вкладки
        : "text-slate-500 hover:text-slate-900 hover:bg-slate-50 font-medium" // Стили неактивной вкладки
      }`;
  };

  return (
    <>
      {/* Затемнение под мобильным меню */}
      <div
        onClick={close}
        aria-hidden="true"
        className={`fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-[2px] transition-opacity lg:hidden ${isOpen ? "opacity-100" : "pointer-events-none opacity-0"
          }`}
      />

      <aside
        className={`w-64 min-h-screen bg-white border-r border-slate-200 p-6 flex flex-col fixed left-0 top-0 z-50 transition-transform duration-300 ease-out lg:translate-x-0 ${isOpen ? "translate-x-0" : "-translate-x-full"
          }`}
      >
        {/* Логотип */}
        <div className="mb-8 pl-2 flex items-center justify-between">
          <Logo />
          <button
            type="button"
            onClick={close}
            aria-label={t("sidebar.closeMenu", "Закрыть меню")}
            className="p-1.5 -mr-1 rounded-lg text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors lg:hidden"
          >
            <X size={20} />
          </button>
        </div>

        {/* Навигация */}
        <nav className="flex-1 space-y-2 mt-4">
          <NavLink to="/student/home" className={getNavLinkClass}>
            <Home size={20} className="opacity-80" />
            <span>{t("sidebar.home", "Главная")}</span>
          </NavLink>

          <NavLink to="/student/quizes" className={getNavLinkClass}>
            <List size={20} className="opacity-80" />
            <span>{t("sidebar.myQuizes", "Тесты и результаты")}</span>
          </NavLink>

          <NavLink to="/student/analytics" className={getNavLinkClass}>
            <ChartLine size={20} className="opacity-80" />
            <span>{t("sidebar.analytics", "Аналитика")}</span>
          </NavLink>

          <NavLink to="/student/profile" className={getNavLinkClass}>
            <Settings size={20} className="opacity-80" />
            <span>{t("sidebar.settings", "Настройки")}</span>
          </NavLink>
        </nav>

        {/* Плашка профиля */}
        <div className="mt-auto pt-6">
          <div className="p-4 bg-[#111827] rounded-2xl text-white shadow-md">
            <p className="text-[10px] font-bold text-slate-400 mb-1.5 tracking-wider uppercase">
              {t("sidebar.loggedInAs")}
            </p>
            <p className="font-medium text-sm truncate" title={user?.full_name}>
              {user?.full_name || t("studentHome.user")}
            </p>
          </div>
        </div>
      </aside>
    </>
  );
};
