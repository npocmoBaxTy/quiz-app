import {
  BookOpen,
  CheckCircle2,
  FileText,
  Users,
  MoreVertical,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { formatQuizDate } from "../../TeacherQuizesPage/hooks/formateDate";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/app/components/ui/collapsible";
import type { Quiz } from "../types";

export const RecentQuizzesList = ({ quizzes }: { quizzes: Quiz[] }) => {
  const { t } = useTranslation();
  const renderQuizItem = (quiz: Quiz) => (
    <div
      key={quiz.id}
      className="bg-white mb-2 p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-blue-300 transition-colors group flex flex-col sm:flex-row sm:items-center justify-between gap-4"
    >
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0 group-hover:bg-blue-50 group-hover:border-blue-100 transition-colors">
          <BookOpen
            size={24}
            className="text-slate-400 group-hover:text-blue-500"
          />
        </div>
        <div>
          <h3 className="font-bold text-slate-800 text-base">{quiz.title}</h3>
          <div className="flex items-center gap-3 mt-1 text-sm">
            {quiz.published ? (
              <span className="inline-flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded font-medium text-xs">
                <CheckCircle2 size={12} /> {t("teacherDashboard.quizCard.published")}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-slate-500 bg-slate-100 px-2 py-0.5 rounded font-medium text-xs">
                <FileText size={12} /> {t("teacherDashboard.quizCard.draft")}
              </span>
            )}
            <span className="text-slate-400 flex items-center gap-1">
              <Users size={12} /> {quiz.attemptsCount}
            </span>
            <span className="text-slate-400 hidden sm:inline-block">
              • {formatQuizDate(quiz.created_at)}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-6 sm:pl-4 sm:border-l border-slate-100">
        <div className="text-center">
          <p className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-1">
            {t("teacherDashboard.recentQuizzes.avgScore")}
          </p>
          <p className="font-bold text-slate-800">
            {quiz.avgScore ? `${quiz.avgScore}` : "—"}
          </p>
        </div>
        <button className="p-2 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors">
          <MoreVertical size={20} />
        </button>
      </div>
    </div>
  );

  return (
    <div className="lg:col-span-2 flex flex-col gap-4">
      <Collapsible defaultOpen={false}>
        <div className="flex justify-between items-end mb-2">
          <h2 className="text-lg font-bold text-slate-800">{t("teacherDashboard.recentQuizzes.title")}</h2>
          <CollapsibleTrigger className="text-sm font-medium text-blue-600 hover:text-blue-800">
            {t("teacherDashboard.recentQuizzes.viewAll")}
          </CollapsibleTrigger>
        </div>

        {/* Первые 5 элементов */}
        {quizzes.slice(0, 5).map(renderQuizItem)}

        {/* Остальные элементы под капотом */}
        <CollapsibleContent>
          {quizzes.slice(5).map(renderQuizItem)}
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};
