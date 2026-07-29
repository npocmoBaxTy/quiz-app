import { Logo } from "@/shared/ui/Logo/Logo";
import { LangSwitcher } from "./../LangSwitcher";
import { Profile } from "../Profile/Profile";
import { useAuthStore } from "@/features/auth/store/authstore";
import { NavLink } from "react-router-dom";
import { Plus } from "lucide-react";

export const Header = () => {
  const { user } = useAuthStore();
  return (
    <div className="header flex w-full items-center p-4 shadow-lg bg-white">
      <Logo />
      <div className="header__links flex items-center gap-2 ml-auto">
        {user?.role === "TEACHER" && (
          <NavLink
            to={"/teacher/create-quiz"}
            className={
              "flex items-center gap-1 px-3 py-2 bg-(--success-green) rounded-xl text-white text-sm"
            }
          >
            <Plus size={15} />
            Создать тест
          </NavLink>
        )}
        {user?.email && <Profile />}
        <LangSwitcher />
      </div>
    </div>
  );
};
