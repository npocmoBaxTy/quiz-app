import { useAuthStore } from "@/features/auth/store/authstore";
import { useSidebarStore } from "@/shared/store/sidebarStore";
import { Logo } from "@/shared/ui/Logo/Logo";
import { BarChart2, FileText, Users, Settings, LogOut, X } from "lucide-react";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Link, useLocation } from "react-router-dom";

const DASHBOARD_PATH = "/user/profile";

export const TeacherSidebar = () => {
  const { t } = useTranslation();
  const { user, logout } = useAuthStore();
  const { isOpen, close, setMounted } = useSidebarStore();
  const location = useLocation();

  // Сообщаем шапке, что на этой странице нужен бургер
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, [setMounted]);

  // Переход по ссылке закрывает мобильное меню
  useEffect(() => {
    close();
  }, [location.pathname, location.search, close]);

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

  // Вкладки дашборда отличаются только query-параметром, поэтому обычный
  // NavLink здесь не годится — активность считаем вручную
  const tab = new URLSearchParams(location.search).get("tab");
  const isDashboard = location.pathname === DASHBOARD_PATH;

  const items = [
    {
      to: DASHBOARD_PATH,
      icon: BarChart2,
      label: t("teacherDashboard.aside.dashboard"),
      active: isDashboard && !tab,
    },
    {
      to: "/teacher/quizes",
      icon: FileText,
      label: t("teacherDashboard.aside.myQuizzes"),
      active: location.pathname === "/teacher/quizes",
    },
    {
      to: `${DASHBOARD_PATH}?tab=students`,
      icon: Users,
      label: t("teacherDashboard.aside.students"),
      active: isDashboard && tab === "students",
    },
    {
      to: `${DASHBOARD_PATH}?tab=settings`,
      icon: Settings,
      label: t("teacherDashboard.aside.settings"),
      active: isDashboard && tab === "settings",
    },
  ];

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
        className={`w-64 min-h-screen bg-white border-r border-slate-200 flex flex-col fixed left-0 top-0 z-50 transition-transform duration-300 ease-out lg:translate-x-0 ${isOpen ? "translate-x-0" : "-translate-x-full"
          }`}
      >
        <div className="p-6 flex items-center justify-between">
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

        <nav className="flex-1 px-4 flex flex-col gap-1 overflow-y-auto">
          {items.map(({ to, icon: Icon, label, active }) => (
            <Link
              key={label}
              to={to}
              className={`flex items-center gap-3 w-full p-3 rounded-lg transition-all font-medium ${active
                  ? "bg-blue-50 text-blue-700"
                  : "text-slate-500 hover:bg-slate-100 hover:text-slate-800"
                }`}
            >
              <Icon
                size={18}
                className={active ? "text-blue-600" : "text-slate-400"}
              />
              {label}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-200 mt-auto">
          <p className="px-3 pb-3 text-sm font-medium text-slate-700 truncate" title={user?.full_name}>
            {user?.full_name}
          </p>
          <button
            onClick={logout}
            className="flex items-center gap-3 w-full p-3 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut size={18} />
            <span className="font-medium">
              {t("teacherDashboard.aside.logout")}
            </span>
          </button>
        </div>
      </aside>
    </>
  );
};
