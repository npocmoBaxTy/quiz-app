import { useAuthStore } from "@/features/auth/store/authstore";
import { Search, Bell } from "lucide-react";

export const DashboardHeader = () => {
  const { user } = useAuthStore();
  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-10">
      <div className="flex-1 max-w-xl hidden md:flex items-center relative">
        <Search className="absolute left-3 text-slate-400" size={18} />
        <input
          type="text"
          placeholder="Поиск тестов, студентов..."
          className="w-full pl-10 pr-4 py-2 bg-slate-100 border-transparent focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-lg outline-none transition-all text-sm"
        />
      </div>

      <div className="flex items-center gap-6 ml-auto">
        <button className="text-slate-400 hover:text-slate-600 relative">
          <Bell size={20} />
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
        </button>
        <div className="flex items-center gap-3 border-l border-slate-200 pl-6 cursor-pointer">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-slate-700">
              {user?.full_name}
            </p>
            <p className="text-xs text-slate-500">Преподаватель</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-linear-to-tr from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold shadow-sm">
            {user?.full_name
              ?.split(" ")
              .map((n) => n[0])
              .join("")}
          </div>
        </div>
      </div>
    </header>
  );
};
