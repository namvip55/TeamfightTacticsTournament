"use client";

import { Gem, Trophy, ShoppingBag, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

interface Transaction {
  id: string;
  amount: number;
  reason: string;
  admin_note: string | null;
  created_at: string;
  tournaments?: { name: string } | null;
}

interface DiamondHistoryProps {
  transactions: Transaction[];
}

const REASON_CONFIG: Record<
  string,
  { icon: typeof Trophy; label: string; color: string }
> = {
  tournament_prize: {
    icon: Trophy,
    label: "Giải Thưởng",
    color: "text-amber-400",
  },
  shop_purchase: {
    icon: ShoppingBag,
    label: "Mua Hàng",
    color: "text-rose-400",
  },
  admin_adjust: {
    icon: Settings,
    label: "Điều Chỉnh",
    color: "text-zinc-400",
  },
};

export default function DiamondHistory({ transactions }: DiamondHistoryProps) {
  if (transactions.length === 0) {
    return (
      <div className="glass-card p-6">
        <h3 className="text-sm font-mono font-bold text-zinc-400 uppercase mb-4 flex items-center gap-2">
          <Gem className="w-4 h-4 text-cyan-400" />
          Lịch Sử Kim Cương
        </h3>
        <div className="p-6 text-center text-zinc-500 text-sm border border-dashed border-white/[0.06] rounded-xl">
          Chưa có giao dịch kim cương nào.
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card overflow-hidden">
      <div className="p-4 border-b border-white/[0.06]">
        <h3 className="text-sm font-mono font-bold text-zinc-400 uppercase flex items-center gap-2">
          <Gem className="w-4 h-4 text-cyan-400" />
          Lịch Sử Kim Cương
        </h3>
      </div>
      <div className="divide-y divide-white/[0.03] max-h-[400px] overflow-y-auto">
        {transactions.map((tx) => {
          const config = REASON_CONFIG[tx.reason] || REASON_CONFIG.admin_adjust;
          const Icon = config.icon;
          return (
            <div
              key={tx.id}
              className="px-4 py-3 flex items-center justify-between hover:bg-white/[0.02] transition-colors"
            >
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center",
                    tx.amount > 0
                      ? "bg-green-500/10 border border-green-500/20"
                      : "bg-rose-500/10 border border-rose-500/20"
                  )}
                >
                  <Icon className={cn("w-3.5 h-3.5", config.color)} />
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs font-mono text-zinc-200">
                    {config.label}
                  </span>
                  {tx.admin_note && (
                    <span className="text-[10px] text-zinc-500 font-mono">
                      {tx.admin_note}
                    </span>
                  )}
                  <span className="text-[10px] text-zinc-600 font-mono">
                    {new Date(tx.created_at).toLocaleString("vi-VN")}
                  </span>
                </div>
              </div>
              <span
                className={cn(
                  "text-sm font-mono font-bold flex items-center gap-1",
                  tx.amount > 0 ? "text-green-400" : "text-rose-400"
                )}
              >
                <Gem className="w-3 h-3" />
                {tx.amount > 0 ? "+" : ""}
                {tx.amount}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
