import { Logo } from "@/shared/ui/Logo/Logo";
import { LangSwitcher } from "./../LangSwitcher";
import { Profile } from "../Profile/Profile";
import { useAuthStore } from "@/features/auth/store/authstore";
import { NavLink } from "react-router-dom";
import { Menu, Plus } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useSidebarStore } from "@/shared/store/sidebarStore";

export const Header = () => {
  const { user } = useAuthStore();
  const { t } = useTranslation();
  const { isOpen, isMounted, toggle } = useSidebarStore();

  return (
    <div className="header flex w-full items-center gap-3 p-4 shadow-lg bg-white">
      {/* Бургер показываем только там, где на странице есть сайдбар */}
      {isMounted && (
        <button
          type="button"
          onClick={toggle}
          aria-label={t("sidebar.openMenu", "Открыть меню")}
          aria-expanded={isOpen}
          className="p-2 -ml-1 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors lg:hidden"
        >
          <Menu size={22} />
        </button>
      )}

      {/* Логотип живет в сайдбаре, когда тот есть. На узких экранах сайдбар
          уезжает за край, поэтому там шапка снова берет логотип на себя. */}
      <div className={isMounted ? "lg:hidden" : undefined}>
        <Logo />
      </div>
      <div className="header__links flex items-center gap-2 ml-auto">
        {user?.role === "TEACHER" && (
          <NavLink
            to={"/teacher/create-quiz"}
            className={
              "flex items-center gap-1 px-3 py-2 bg-(--success-green) rounded-xl text-white text-sm"
            }
          >
            <Plus size={15} />
            {t("teacherDashboard.createQuiz")}
          </NavLink>
        )}
        {user?.email && <Profile />}
        <LangSwitcher />
      </div>
    </div>
  );
};
