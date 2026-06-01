"use client";

import { useState } from "react";
import { awardDiamondsAction } from "../lib/player-actions";
import { cn } from "@/lib/utils";
import {
  Trophy,
  Crown,
  Medal,
  Award,
  Gem,
  Loader2,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

interface Standing {
  id: string;
  player_id: string;
  riot_id: string;
  discord_id: string;
  total_points: number;
  avg_placement: number;
  total_wins: number;
  games_played: number;
}

interface AwardDiamondsProps {
  tournamentId: string;
  tournamentName: string;
  standings: Standing[];
}

const DEFAULT_PRIZES: Record<number, number> = {
  1: 100,
  2: 60,
  3: 40,
  4: 20,
};

const RANK_CONFIG: Record<
  number,
  { icon: typeof Crown; label: string; color: string }
> = {
  1: { icon: Crown, label: "Vô Địch", color: "text-amber-400" },
  2: { icon: Medal, label: "Á Quân", color: "text-zinc-300" },
  3: { icon: Award, label: "Hạng 3", color: "text-amber-600" },
  4: { icon: Trophy, label: "Hạng 4", color: "text-violet-400" },
};

export default function AwardDiamonds({
  tournamentId,
  tournamentName,
  standings,
}: AwardDiamondsProps) {
  const top4 = standings.slice(0, 4);
  const [prizes, setPrizes] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    top4.forEach((s, idx) => {
      initial[s.player_id] = DEFAULT_PRIZES[idx + 1] || 0;
    });
    return initial;
  });
  const [isAwarding, setIsAwarding] = useState(false);
  const [message, setMessage] = useState<{
    text: string;
    type: "success" | "error";
  } | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [awardResults, setAwardResults] = useState<any[] | null>(null);

  const handlePrizeChange = (playerId: string, value: number) => {
    setPrizes((prev) => ({ ...prev, [playerId]: Math.max(0, value) }));
  };

  const totalPrize = Object.values(prizes).reduce((sum, v) => sum + v, 0);

  const handleAward = async () => {
    setIsAwarding(true);
    setMessage(null);
    setShowConfirm(false);

    const prizeList = top4
      .map((s, idx) => ({
        playerId: s.player_id,
        amount: prizes[s.player_id] || 0,
        rank: idx + 1,
      }))
      .filter((p) => p.amount > 0);

    const result = await awardDiamondsAction(tournamentId, prizeList);

    setIsAwarding(false);

    if (result.success) {
      setMessage({ text: "Đã trao giải thành công!", type: "success" });
      setAwardResults(result.results || []);
    } else {
      setMessage({ text: result.error || "Lỗi trao giải", type: "error" });
    }
  };

  if (standings.length === 0) {
    return (
      <div className="glass-card p-6 text-center text-zinc-500 text-sm font-mono">
        Giải đấu chưa có bảng xếp hạng. Hãy tính điểm trước khi trao giải.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Tournament Info */}
      <div className="glass-card p-4">
        <span className="text-[9px] text-zinc-500 font-mono uppercase tracking-wider">
          Trao Giải Cho
        </span>
        <p className="text-sm font-bold text-white mt-1">{tournamentName}</p>
      </div>

      {/* Top 4 Prize Table */}
      <div className="glass-card overflow-hidden">
        <div className="p-4 border-b border-white/[0.06]">
          <h4 className="text-xs font-mono font-bold text-zinc-400 uppercase flex items-center gap-2">
            <Gem className="w-3.5 h-3.5 text-cyan-400" />
            Thiết Lập Giải Thưởng Top 4
          </h4>
        </div>
        <div className="divide-y divide-white/[0.04]">
          {top4.map((standing, idx) => {
            const rank = idx + 1;
            const config = RANK_CONFIG[rank];
            const Icon = config.icon;
            return (
              <div
                key={standing.player_id}
                className="p-4 flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div
                    className={cn(
                      "w-10 h-10 rounded-lg flex items-center justify-center",
                      rank === 1
                        ? "bg-amber-500/10 border border-amber-500/20"
                        : rank === 2
                        ? "bg-zinc-400/10 border border-zinc-400/20"
                        : rank === 3
                        ? "bg-amber-700/10 border border-amber-700/20"
                        : "bg-violet-500/10 border border-violet-500/20"
                    )}
                  >
                    <Icon className={cn("w-5 h-5", config.color)} />
                  </div>
                  <div className="flex flex-col">
                    <span
                      className={cn(
                        "text-[10px] font-mono font-bold uppercase",
                        config.color
                      )}
                    >
                      {config.label}
                    </span>
                    <span className="text-sm font-mono font-semibold text-zinc-200 truncate">
                      {standing.riot_id}
                    </span>
                    <span className="text-[10px] text-zinc-500 font-mono">
                      {standing.total_points}đ • {standing.games_played} trận
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Gem className="w-4 h-4 text-cyan-400" />
                  <input
                    type="number"
                    value={prizes[standing.player_id] || 0}
                    onChange={(e) =>
                      handlePrizeChange(
                        standing.player_id,
                        Number(e.target.value)
                      )
                    }
                    min={0}
                    max={9999}
                    className="w-20 bg-white/[0.03] border border-white/[0.08] rounded-lg px-3 py-2 text-sm font-mono font-bold text-cyan-400 text-center focus:outline-none focus:border-violet-500/50"
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Total + Award Button */}
      <div className="glass-card p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-zinc-500">
            Tổng giải thưởng:
          </span>
          <span className="text-lg font-mono font-bold text-cyan-400 flex items-center gap-1">
            <Gem className="w-4 h-4" />
            {totalPrize}
          </span>
        </div>
        <button
          onClick={() => setShowConfirm(true)}
          disabled={isAwarding || totalPrize === 0}
          className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-black font-bold text-xs font-mono rounded-lg transition-all cursor-pointer disabled:opacity-50 flex items-center gap-2"
        >
          <Trophy className="w-3.5 h-3.5" />
          Trao Giải
        </button>
      </div>

      {/* Message */}
      {message && (
        <div
          className={cn(
            "p-4 rounded-lg border text-xs font-mono flex items-center gap-2",
            message.type === "success"
              ? "bg-green-500/10 text-green-400 border-green-500/20"
              : "bg-rose-500/10 text-rose-400 border-rose-500/20"
          )}
        >
          {message.type === "success" ? (
            <CheckCircle2 className="w-4 h-4" />
          ) : (
            <XCircle className="w-4 h-4" />
          )}
          {message.text}
        </div>
      )}

      {/* Award Results */}
      {awardResults && (
        <div className="glass-card p-4">
          <h4 className="text-xs font-mono font-bold text-zinc-400 uppercase mb-3">
            Kết Quả Trao Giải
          </h4>
          <div className="flex flex-col gap-2">
            {awardResults.map((r: any, idx: number) => (
              <div
                key={idx}
                className={cn(
                  "flex items-center justify-between p-2 rounded text-xs font-mono",
                  r.success
                    ? "bg-green-500/5 text-green-400"
                    : "bg-rose-500/5 text-rose-400"
                )}
              >
                <span>{r.riotId || r.playerId}</span>
                <span>
                  {r.success
                    ? `✓ +${prizes[r.playerId] || 0}💎 (Tổng: ${r.newBalance})`
                    : `✗ ${r.error}`}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Confirm Dialog */}
      <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
        <DialogContent className="bg-[#141420] border-white/[0.08]">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-400" />
              Xác Nhận Trao Giải
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-zinc-400 font-mono">
            Trao giải cho giải đấu{" "}
            <strong className="text-white">{tournamentName}</strong>?
          </p>
          <div className="flex flex-col gap-2">
            {top4.map((s, idx) => {
              const amount = prizes[s.player_id] || 0;
              if (amount <= 0) return null;
              const config = RANK_CONFIG[idx + 1];
              return (
                <div
                  key={s.player_id}
                  className="flex items-center justify-between text-xs font-mono"
                >
                  <span className="text-zinc-300">
                    {s.riot_id}
                  </span>
                  <span className="text-cyan-400 font-bold flex items-center gap-1">
                    <Gem className="w-3 h-3" />+{amount}
                  </span>
                </div>
              );
            })}
            <div className="border-t border-white/[0.06] pt-2 flex items-center justify-between text-sm font-mono font-bold">
              <span className="text-zinc-400">Tổng</span>
              <span className="text-cyan-400 flex items-center gap-1">
                <Gem className="w-4 h-4" />
                {totalPrize}
              </span>
            </div>
          </div>
          <DialogFooter>
            <button
              onClick={handleAward}
              className="flex-1 py-2.5 bg-gradient-to-r from-amber-500 to-amber-400 text-black text-sm font-mono font-bold rounded-lg transition-colors cursor-pointer"
            >
              Xác Nhận Trao Giải
            </button>
            <button
              onClick={() => setShowConfirm(false)}
              className="flex-1 py-2.5 bg-white/[0.04] border border-white/[0.08] text-zinc-400 hover:text-zinc-200 text-sm font-mono font-bold rounded-lg transition-colors cursor-pointer"
            >
              Hủy
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
