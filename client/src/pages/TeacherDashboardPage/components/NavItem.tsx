import type { JSX } from "react";

export const NavItem = ({
  icon: Icon,
  label,
  active,
  onClick,
}: {
  icon: JSX.ElementType;
  label: string;
  active?: boolean;
  onClick: () => void;
}) => {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-3 w-full p-3 rounded-lg transition-all font-medium ${
        active
          ? "bg-blue-50 text-blue-700"
          : "text-slate-500 hover:bg-slate-100 hover:text-slate-800"
      }`}
    >
      <Icon size={18} className={active ? "text-blue-600" : "text-slate-400"} />
      {label}
    </button>
  );
};
