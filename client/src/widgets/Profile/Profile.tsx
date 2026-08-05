import { Button } from "@/app/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/app/components/ui/dropdown-menu";
import { useAuthCtx } from "@/app/providers/auth/useAuthContext";
import { useAuthStore } from "@/features/auth/store/authstore";
import { Divider } from "@/features/auth/ui/Divider";
import { Avatar } from "@/shared/ui/Avatar/Avatar";
import { NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";

export const Profile = () => {
  const { user } = useAuthStore();
  const { logout } = useAuthCtx()
  const { t } = useTranslation();

  return (
    <div className="lang__swithcer-wrapper">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button className="bg-transparent text-white cursor-pointer hover:bg-transparent">
            <div className="flex items-center gap-5 ml-auto">
              <div className="w-px h-6 bg-slate-200"></div>
              <div className="flex items-center gap-3 cursor-pointer group">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-bold text-slate-700 group-hover:text-indigo-600 transition-colors">{user?.full_name}</p>
                  <p className="text-xs text-slate-500">{user?.role} • {user?.group || t("profile.noGroup")}</p>
                </div>
                <div className="rounded-full border-2 border-transparent group-hover:border-indigo-100 transition-all">
                  <Avatar src={user?.avatar_url} name={user?.full_name || ""} size={40} />
                </div>
              </div>
            </div>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="z-100">
          <div className="px-1">
            <Divider label={user?.full_name || ""} />
          </div>
          <DropdownMenuGroup>
            <DropdownMenuItem>
              <NavLink to={user?.role === "STUDENT" ? "/student/profile" : "/user/profile"}>{t("profile.profileLink")}</NavLink>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={logout}>
              <button type="button" className="cursor-pointer">
                {t("auth.logout")}
              </button>
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
