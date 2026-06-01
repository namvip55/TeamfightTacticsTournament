import { redirect } from "next/navigation";
import Link from "next/link";
import { supabase } from "../lib/supabase";
import { getPlayerSession } from "../lib/player-auth";
import Sidebar from "../components/Sidebar";
import AvatarUpload from "../components/AvatarUpload";
import TrophyCase from "../components/TrophyCase";
import DiamondDisplay from "../components/DiamondDisplay";
import ProfileEditForm from "./ProfileEditForm";
import DiamondHistory from "./DiamondHistory";
import { User, Trophy, Gem, ShoppingBag, History, BarChart3 } from "lucide-react";

export const revalidate = 0;

export default async function ProfilePage() {
  const session = await getPlayerSession();

  if (!session) {
    redirect("/");
  }

  const { data: player } = await supabase
    .from("players")
    .select("*")
    .eq("id", session.playerId)
    .single();

  if (!player) {
    redirect("/");
  }

  const { data: trophies } = await supabase
    .from("trophies")
    .select("*")
    .eq("player_id", session.playerId)
    .order("awarded_at", { ascending: false });

  const { data: transactions } = await supabase
    .from("diamond_transactions")
    .select("*, tournaments(name)")
    .eq("player_id", session.playerId)
    .order("created_at", { ascending: false })
    .limit(20);

  const { data: purchases } = await supabase
    .from("shop_purchases")
    .select("*, shop_items(name, item_type)")
    .eq("player_id", session.playerId)
    .order("created_at", { ascending: false })
    .limit(10);

  // Fetch all standings for personal stats
  const { data: allStandings } = await supabase
    .from("standings")
    .select("*, tournaments(name, status, mode)")
    .eq("player_id", session.playerId)
    .order("created_at", { ascending: false });

  // Calculate aggregate stats
  let totalGames = 0;
  let totalWins = 0;
  let totalTop4 = 0;
  let totalPoints = 0;
  let bestPlacement = Infinity;
  let bestTournament = "";

  if (allStandings) {
    allStandings.forEach((s) => {
      totalGames += s.games_played;
      totalWins += s.total_wins;
      totalTop4 += s.total_top4;
      totalPoints += s.total_points;
      if (s.total_points > 0 && (bestPlacement === Infinity || s.avg_placement < bestPlacement)) {
        bestPlacement = s.avg_placement;
        bestTournament = s.tournaments?.name || "";
      }
    });
  }

  const winRate = totalGames > 0 ? ((totalWins / totalGames) * 100).toFixed(1) : "0.0";
  const top4Rate = totalGames > 0 ? ((totalTop4 / totalGames) * 100).toFixed(1) : "0.0";
  const avgPlacement = totalGames > 0 ? (allStandings?.reduce((sum, s) => sum + (s.avg_placement * s.games_played), 0) / totalGames).toFixed(2) : "N/A";

  return (
    <Sidebar session={session}>
      <div className="p-4 lg:p-8 flex flex-col gap-8 max-w-5xl mx-auto">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-3">
            <User className="w-6 h-6 text-violet-400" />
            Hồ Sơ Của Tôi
          </h1>
          <DiamondDisplay amount={player.diamonds || 0} size="md" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Avatar + Stats + Trophies */}
          <div className="lg:col-span-1 flex flex-col gap-6">
            <div className="glass-card p-6 flex flex-col items-center gap-4">
              <AvatarUpload
                currentAvatarUrl={player.avatar_url}
                discordAvatarUrl={player.discord_avatar_url}
                displayName={player.display_name || ""}
                discordUsername={player.discord_username || ""}
              />
              <div className="text-center">
                <h2 className="text-xl font-semibold text-white">
                  {player.display_name || player.riot_id}
                </h2>
                <p className="text-xs text-zinc-500 font-mono mt-1">
                  @{player.discord_username || player.discord_id}
                </p>
              </div>
            </div>

            <div className="glass-card p-5">
              <h3 className="text-xs font-mono font-bold text-zinc-500 uppercase mb-3 flex items-center gap-2">
                <BarChart3 className="w-3.5 h-3.5 text-violet-400" />
                Thống Kê Cá Nhân
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Tổng Trận", value: totalGames, color: "text-white" },
                  { label: "Tỷ Lệ Thắng", value: `${winRate}%`, color: "text-violet-400" },
                  { label: "Top 4 Rate", value: `${top4Rate}%`, color: "text-cyan-400" },
                  { label: "Vị Trí TB", value: avgPlacement, color: "text-amber-400" },
                  { label: "Tổng Điểm", value: totalPoints, color: "text-green-400" },
                  { label: "Giải Đấu", value: allStandings?.length || 0, color: "text-zinc-300" },
                  { label: "Cúp", value: trophies?.length || 0, color: "text-amber-400" },
                  { label: "Kim Cương", value: player.diamonds || 0, color: "text-cyan-400" },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="bg-white/[0.02] border border-white/[0.06] p-3 rounded-lg text-center"
                  >
                    <span className={`text-xl font-bold ${stat.color}`}>
                      {stat.value}
                    </span>
                    <p className="text-[9px] text-zinc-500 font-mono uppercase mt-1">
                      {stat.label}
                    </p>
                  </div>
                ))}
              </div>
              {bestTournament && (
                <div className="mt-3 pt-3 border-t border-white/[0.06]">
                  <p className="text-[10px] text-zinc-500 font-mono">
                    Giải hay nhất: <span className="text-zinc-300 font-semibold">{bestTournament}</span>
                  </p>
                </div>
              )}
            </div>

            {/* Recent Tournaments */}
            {allStandings && allStandings.length > 0 && (
              <div className="glass-card p-5">
                <h3 className="text-xs font-mono font-bold text-zinc-500 uppercase mb-3 flex items-center gap-2">
                  <History className="w-3.5 h-3.5 text-violet-400" />
                  Giải Đấu Gần Đây
                </h3>
                <div className="flex flex-col gap-2">
                  {allStandings.slice(0, 5).map((s) => {
                    const top4R = s.games_played > 0 ? ((s.total_top4 / s.games_played) * 100).toFixed(0) : "0";
                    return (
                      <Link
                        key={s.id}
                        href={`/tournaments/${s.tournament_id}`}
                        className="flex items-center justify-between p-2.5 rounded-lg bg-white/[0.02] border border-white/[0.06] hover:border-violet-500/30 transition-colors group"
                      >
                        <div className="flex flex-col min-w-0">
                          <span className="text-sm font-semibold text-zinc-200 truncate group-hover:text-violet-400 transition-colors">
                            {s.tournaments?.name || "N/A"}
                          </span>
                          <span className="text-[10px] text-zinc-500 font-mono">
                            {s.games_played} trận • Top4: {top4R}%
                          </span>
                        </div>
                        <span className="text-sm font-mono font-bold text-violet-400">
                          {s.total_points}đ
                        </span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="glass-card p-5">
              <h3 className="text-xs font-mono font-bold text-zinc-500 uppercase mb-4 flex items-center gap-2">
                <Trophy className="w-3.5 h-3.5 text-amber-400" />
                Bộ Sưu Tập Cúp
              </h3>
              <TrophyCase trophies={trophies || []} />
            </div>
          </div>

          {/* Right: Edit Form + History */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            <ProfileEditForm
              displayName={player.display_name || ""}
              bio={player.bio || ""}
              socialLinks={player.social_links || {}}
            />

            <DiamondHistory transactions={transactions || []} />

            {purchases && purchases.length > 0 && (
              <div className="glass-card overflow-hidden">
                <div className="p-4 border-b border-white/[0.06]">
                  <h3 className="text-sm font-mono font-bold text-zinc-400 flex items-center gap-2">
                    <ShoppingBag className="w-4 h-4 text-cyan-400" />
                    Lịch Sử Mua Hàng
                  </h3>
                </div>
                <div className="divide-y divide-white/[0.03]">
                  {purchases.map((p) => (
                    <div
                      key={p.id}
                      className="px-4 py-3 flex items-center justify-between"
                    >
                      <div>
                        <span className="text-sm font-mono text-zinc-200">
                          {p.shop_items?.name}
                        </span>
                        <span className="text-[10px] text-zinc-500 font-mono ml-2">
                          {new Date(p.created_at).toLocaleDateString("vi-VN")}
                        </span>
                      </div>
                      <span className="text-xs font-mono font-bold text-rose-400 flex items-center gap-1">
                        <Gem className="w-3 h-3" />-{p.diamonds_spent}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Sidebar>
  );
}

