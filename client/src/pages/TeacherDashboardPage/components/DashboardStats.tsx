import { BookOpen, Users, TrendingUp, FileText } from "lucide-react";
import { StatCard } from "./StatCard";
import type { Quiz } from "../types";

// Укажите тут правильный тип вместо any, если он у вас есть (например, Quiz[])
export const DashboardStats = ({ data }: { data: Quiz[] }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <StatCard
        title="Активных тестов"
        value={data.filter((quiz) => quiz.published).length}
        icon={BookOpen}
        color="text-blue-600"
        bg="bg-blue-100"
      />
      <StatCard
        title="Всего студентов"
        value={data.reduce((acc, quiz) => acc + quiz.attemptsCount, 0)}
        icon={Users}
        color="text-emerald-600"
        bg="bg-emerald-100"
      />
      <StatCard
        title="Средний балл"
        value={`${data.reduce((acc, quiz) => acc + quiz.avgScore, 0) / Math.max(data.length, 1)}`.slice(
          0,
          4,
        )}
        icon={TrendingUp}
        color="text-amber-600"
        bg="bg-amber-100"
      />
      <StatCard
        title="Черновиков"
        value={data.filter((quiz) => !quiz.published).length}
        icon={FileText}
        color="text-orange-600"
        bg="bg-orange-100"
      />
    </div>
  );
};
