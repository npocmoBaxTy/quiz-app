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
import { User } from "lucide-react";
import { NavLink } from "react-router-dom";

export const Profile = () => {
  const { user } = useAuthStore();
  const { logout } = useAuthCtx()

  return (
    <div className="lang__swithcer-wrapper">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button className="bg-(--main-blue) text-white cursor-pointer">
            <User />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="z-100">
          <div className="px-1">
            <Divider label={user?.full_name || ""} />
          </div>
          <DropdownMenuGroup>
            <DropdownMenuItem>
              <NavLink to={"/user/profile"}>Профиль</NavLink>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={logout}>
              <button type="button" className="cursor-pointer">
                Выйти
              </button>
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
