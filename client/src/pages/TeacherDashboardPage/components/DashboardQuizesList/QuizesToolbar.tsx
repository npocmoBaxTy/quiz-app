import { Search } from "lucide-react";
import { useTranslation } from "react-i18next";

interface QuizzesToolbarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filter: "all" | "published" | "drafts";
  setFilter: (filter: "all" | "published" | "drafts") => void;
}

export function QuizzesToolbar({
  searchQuery,
  setSearchQuery,
  filter,
  setFilter,
}: QuizzesToolbarProps) {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col md:flex-row gap-4 mb-6">
      {/* Поиск */}
      <div className="relative flex-1">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          size={18}
        />
        <input
          type="text"
          placeholder={t("teacherDashboard.toolbar.searchPlaceholder")}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
        />
      </div>

      {/* Табы фильтров */}
      <div className="flex bg-slate-200/50 p-1 rounded-xl shrink-0">
        {(["all", "published", "drafts"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
              filter === tab
                ? "bg-white text-slate-800 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            {tab === "all" && t("teacherDashboard.toolbar.all")}
            {tab === "published" && t("teacherDashboard.toolbar.published")}
            {tab === "drafts" && t("teacherDashboard.toolbar.drafts")}
          </button>
        ))}
      </div>
    </div>
  );
}
