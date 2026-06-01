import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  accent?: "violet" | "cyan" | "amber" | "rose" | "green";
  className?: string;
}

const accentMap = {
  violet: {
    icon: "text-violet-400",
    bg: "bg-violet-500/10",
    border: "border-violet-500/20",
    glow: "shadow-[0_0_15px_rgba(139,92,246,0.15)]",
    value: "text-violet-400",
  },
  cyan: {
    icon: "text-cyan-400",
    bg: "bg-cyan-500/10",
    border: "border-cyan-500/20",
    glow: "shadow-[0_0_15px_rgba(6,182,212,0.15)]",
    value: "text-cyan-400",
  },
  amber: {
    icon: "text-amber-400",
    bg: "bg-amber-500/10",
    border: "border-amber-500/20",
    glow: "shadow-[0_0_15px_rgba(245,158,11,0.15)]",
    value: "text-amber-400",
  },
  rose: {
    icon: "text-rose-400",
    bg: "bg-rose-500/10",
    border: "border-rose-500/20",
    glow: "shadow-[0_0_15px_rgba(244,63,94,0.15)]",
    value: "text-rose-400",
  },
  green: {
    icon: "text-green-400",
    bg: "bg-green-500/10",
    border: "border-green-500/20",
    glow: "shadow-[0_0_15px_rgba(34,197,94,0.15)]",
    value: "text-green-400",
  },
};

export default function StatCard({
  label,
  value,
  icon: Icon,
  accent = "violet",
  className,
}: StatCardProps) {
  const colors = accentMap[accent];

  return (
    <div
      className={cn(
        "glass-card p-5 flex items-center gap-4 group",
        className
      )}
    >
      <div
        className={cn(
          "w-11 h-11 rounded-xl flex items-center justify-center border",
          colors.bg,
          colors.border
        )}
      >
        <Icon className={cn("w-5 h-5", colors.icon)} />
      </div>
      <div className="flex flex-col">
        <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider font-bold">
          {label}
        </span>
        <span className={cn("text-2xl font-bold animate-count", colors.value)}>
          {value}
        </span>
      </div>
    </div>
  );
}
