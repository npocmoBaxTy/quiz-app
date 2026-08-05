import { useState } from "react";
import { NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ChevronDown } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../../../app/components/ui/collapsible";
import { LateBadge } from "@/shared/ui/LateBadge/LateBadge";
import { formatQuizDate } from "../../TeacherQuizesPage/hooks/formateDate";
import type { AttemptFeedItem } from "../api/fetchDashboardData";

const VISIBLE_COUNT = 4;

const FeedItem = ({
  activity,
  withBorder,
}: {
  activity: AttemptFeedItem;
  withBorder: boolean;
}) => (
  <NavLink
    to={`/teacher/student-attempt/${activity.id}`}
    className={`p-5 flex items-start gap-4 ${
      withBorder ? "border-b border-slate-100" : ""
    } hover:bg-slate-50 transition-colors cursor-pointer`}
  >
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
      <p className="text-xs text-slate-500 truncate">{activity.quizTitle}</p>
      <div className="flex items-center gap-2 mt-1">
        <p className="text-[10px] text-slate-400 uppercase tracking-wider">
          {formatQuizDate(activity.finishedAt)}
        </p>
        {activity.isLate && (
          <LateBadge overtimeSeconds={activity.overtimeSeconds} compact />
        )}
      </div>
    </div>
  </NavLink>
);

export const LiveActivityFeed = ({
  recentAttempts,
}: {
  recentAttempts: AttemptFeedItem[];
}) => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  const attempts = recentAttempts?.slice(0, 7) ?? [];
  const visible = attempts.slice(0, VISIBLE_COUNT);
  const hidden = attempts.slice(VISIBLE_COUNT);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between items-end mb-2">
        <h2 className="text-lg font-bold text-slate-800">{t("teacherDashboard.liveFeed.title")}</h2>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
        <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex justify-between">
          <p className="text-sm font-medium text-slate-500">
            {t("teacherDashboard.liveFeed.recentSubmissions")}
          </p>
          <p className="text-sm font-medium text-slate-500">{t("teacherDashboard.liveFeed.points")}</p>
        </div>

        <Collapsible open={open} onOpenChange={setOpen}>
          <div className="flex flex-col">
            {visible.map((activity, idx) => (
              <FeedItem
                key={activity.id}
                activity={activity}
                withBorder={idx !== visible.length - 1 || hidden.length > 0}
              />
            ))}
          </div>

          {hidden.length > 0 && (
            <>
              <CollapsibleContent>
                <div className="flex flex-col">
                  {hidden.map((activity, idx) => (
                    <FeedItem
                      key={activity.id}
                      activity={activity}
                      withBorder={idx !== hidden.length - 1}
                    />
                  ))}
                </div>
              </CollapsibleContent>

              <CollapsibleTrigger className="w-full p-4 border-t border-slate-100 flex items-center justify-center gap-2 text-sm font-medium text-slate-500 hover:bg-slate-50 transition-colors cursor-pointer">
                {open
                  ? t("teacherDashboard.liveFeed.showLess")
                  : t("teacherDashboard.liveFeed.showMore", { count: hidden.length })}
                <ChevronDown
                  className={`w-4 h-4 transition-transform ${open ? "rotate-180" : ""}`}
                />
              </CollapsibleTrigger>
            </>
          )}
        </Collapsible>
      </div>
    </div>
  );
};
