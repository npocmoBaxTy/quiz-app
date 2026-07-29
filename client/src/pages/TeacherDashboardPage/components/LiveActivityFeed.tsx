import { NavLink } from "react-router-dom";
import { formatQuizDate } from "../../TeacherQuizesPage/hooks/formateDate";
import type { AttemptFeedItem } from "../api/fetchDashboardData";

export const LiveActivityFeed = ({
  recentAttempts,
}: {
  recentAttempts: AttemptFeedItem[];
}) => {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between items-end mb-2">
        <h2 className="text-lg font-bold text-slate-800">Живая лента</h2>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
        <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex justify-between">
          <p className="text-sm font-medium text-slate-500">
            Последние сдачи тестов
          </p>
          <p className="text-sm font-medium text-slate-500">Баллы</p>
        </div>

        <div className="flex flex-col">
          {recentAttempts?.slice(0, 7).map((activity, idx) => (
            <div
              key={activity.id}
              
            >
              <NavLink to={`/teacher/student-attempt/${activity.id}`} className={`p-5 flex items-start gap-4 ${
                idx !== recentAttempts?.length - 1
                  ? "border-b border-slate-100"
                  : ""
              } hover:bg-slate-50 transition-colors cursor-pointer`}>
                <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center shrink-0 text-slate-600 font-bold text-xs">
                {activity.studentName.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start mb-1">
                  <p className="font-bold text-sm text-slate-800 truncate pr-2">
                    {activity.studentName}
                  </p>
                  <span className="font-bold text-sm text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                    {activity.score}
                  </span>
                </div>
                <p className="text-xs text-slate-500 truncate">
                  {activity.quizTitle}
                </p>
                <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-wider">
                  {formatQuizDate(activity.finishedAt)}
                </p>
              </div>
              </NavLink>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
