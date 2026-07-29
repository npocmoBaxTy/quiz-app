import { BarChart2, FileText, Users, Settings, LogOut } from "lucide-react";
import { NavItem } from "../NavItem";
import { useAuthStore } from "@/features/auth/store/authstore";
import { NavLink } from "react-router-dom";

type Props = {
  activeTab: string;
  setActiveTab: (tab: string) => void;
};

export const DashboardAside = ({ activeTab, setActiveTab }: Props) => {
  const { logout } = useAuthStore();
  return (
    <aside className="w-full md:w-64 bg-white border-r border-slate-200 flex flex-col min-h-screen sticky top-0 z-20">
      <div className="p-6 ">
        <NavLink to={"/"} className={"flex items-center gap-3"}>
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xl leading-none">E</span>
          </div>
          <span className="font-bold text-xl tracking-tight text-slate-900">
            EduEval
          </span>
        </NavLink>
      </div>
      <nav className="flex-1 px-4 flex flex-col gap-1 overflow-y-auto">
        <NavItem
          icon={BarChart2}
          label="Дашборд"
          active={activeTab === "dashboard"}
          onClick={() => setActiveTab("dashboard")}
        />
        <NavItem
          icon={FileText}
          label="Мои тесты"
          active={activeTab === "quizzes"}
          onClick={() => setActiveTab("quizzes")}
        />
        <NavItem
          icon={Users}
          label="Студенты"
          active={activeTab === "students"}
          onClick={() => setActiveTab("students")}
        />
        <NavItem
          icon={Settings}
          label="Настройки"
          active={activeTab === "settings"}
          onClick={() => setActiveTab("settings")}
        />
      </nav>

      <div className="p-4 border-t border-slate-200 mt-auto">
        <button
          onClick={logout}
          className="flex items-center gap-3 w-full p-3 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors"
        >
          <LogOut size={18} />
          <span className="font-medium">Выйти</span>
        </button>
      </div>
    </aside>
  );
};
