import { resolveMediaUrl } from "@/shared/api/resolveMediaUrl";

const GRADIENTS = [
  "from-indigo-500 to-violet-500",
  "from-emerald-500 to-teal-500",
  "from-amber-500 to-orange-500",
  "from-rose-500 to-pink-500",
  "from-sky-500 to-blue-500",
];

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return (parts[0]![0] + parts[1]![0]).toUpperCase();
}

function getGradient(seed: string) {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  }
  return GRADIENTS[Math.abs(hash) % GRADIENTS.length];
}

type Props = {
  src?: string | null;
  name: string;
  size?: number;
  className?: string;
};

export const Avatar = ({ src, name, size = 40, className = "" }: Props) => {
  if (src) {
    return (
      <img
        src={resolveMediaUrl(src)}
        alt={name}
        style={{ width: size, height: size }}
        className={`rounded-full object-cover shrink-0 ${className}`}
      />
    );
  }

  return (
    <div
      style={{ width: size, height: size, fontSize: Math.round(size * 0.38) }}
      className={`rounded-full bg-linear-to-br ${getGradient(name || "?")} text-white font-bold flex items-center justify-center shrink-0 ${className}`}
    >
      {getInitials(name || "?")}
    </div>
  );
};
