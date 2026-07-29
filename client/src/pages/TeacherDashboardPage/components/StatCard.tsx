import type { JSX } from "react";

export const StatCard = ({
  title,
  value,
  icon: Icon,
  color,
  bg,
}: {
  title: string;
  value: string | number;
  icon: JSX.ElementType;
  color: string;
  bg: string;
}) => {
  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-xl ${bg}`}>
          <Icon className={color} size={22} />
        </div>
      </div>
      <div>
        <h3 className="text-3xl font-bold text-slate-800">{value}</h3>
        <p className="text-sm text-slate-500 font-medium mt-1">{title}</p>
      </div>
    </div>
  );
};
