import { Trophy, Medal, Award } from "lucide-react";
import { cn } from "@/lib/utils";

interface TrophyItem {
  id: string;
  trophy_type: string;
  tournament_name: string;
  awarded_at: string;
}

interface TrophyCaseProps {
  trophies: TrophyItem[];
}

const TROPHY_CONFIG: Record<
  string,
  { icon: typeof Trophy; label: string; color: string; glow: string }
> = {
  champion: {
    icon: Trophy,
    label: "Vô Địch",
    color: "text-amber-400",
    glow: "shadow-[0_0_15px_rgba(245,158,11,0.3)]",
  },
  runner_up: {
    icon: Medal,
    label: "Á Quân",
    color: "text-zinc-300",
    glow: "shadow-[0_0_15px_rgba(161,161,170,0.2)]",
  },
  third: {
    icon: Award,
    label: "Hạng Ba",
    color: "text-amber-600",
    glow: "shadow-[0_0_15px_rgba(180,130,80,0.2)]",
  },
};

export default function TrophyCase({ trophies }: TrophyCaseProps) {
  if (trophies.length === 0) {
    return (
      <div className="p-6 text-center border border-dashed border-white/[0.08] rounded-xl">
        <Trophy className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
        <p className="text-zinc-500 text-sm">Chưa có thành tích nào.</p>
        <p className="text-zinc-600 text-xs font-mono mt-1">
          Vô địch giải đấu để nhận cúp!
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {trophies.map((trophy) => {
        const config = TROPHY_CONFIG[trophy.trophy_type] || TROPHY_CONFIG.champion;
        const Icon = config.icon;
        return (
          <div
            key={trophy.id}
            className={cn(
              "glass-card p-4 flex items-start gap-3 group",
              config.glow
            )}
          >
            <div
              className={cn(
                "w-10 h-10 rounded-lg flex items-center justify-center",
                trophy.trophy_type === "champion"
                  ? "bg-amber-500/10 border border-amber-500/20"
                  : trophy.trophy_type === "runner_up"
                  ? "bg-zinc-400/10 border border-zinc-400/20"
                  : "bg-amber-700/10 border border-amber-700/20"
              )}
            >
              <Icon className={cn("w-5 h-5", config.color)} />
            </div>
            <div className="flex flex-col gap-1 flex-1 min-w-0">
              <span
                className={cn(
                  "text-[10px] font-mono font-bold uppercase",
                  config.color
                )}
              >
                {config.label}
              </span>
              <span className="text-sm font-semibold text-zinc-200 line-clamp-2">
                {trophy.tournament_name}
              </span>
              <span className="text-[10px] text-zinc-500 font-mono">
                {new Date(trophy.awarded_at).toLocaleDateString("vi-VN")}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
