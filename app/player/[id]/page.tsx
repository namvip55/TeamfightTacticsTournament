import { notFound } from "next/navigation";
import Link from "next/link";
import { supabase } from "../../lib/supabase";
import { getPlayerSession } from "../../lib/player-auth";
import { getTftRankByPuuid } from "../../lib/actions";
import Sidebar from "../../components/Sidebar";
import TrophyCase from "../../components/TrophyCase";
import DiamondDisplay from "../../components/DiamondDisplay";
import {
  User,
  BarChart3,
  Gem,
  Trophy,
  Swords,
  Crown,
  History,
  Shield,
} from "lucide-react";

const RANK_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  CHALLENGER: { bg: "bg-amber-500/10", text: "text-amber-400", border: "border-amber-500/30" },
  GRANDMASTER: { bg: "bg-rose-500/10", text: "text-rose-400", border: "border-rose-500/30" },
  MASTER: { bg: "bg-purple-500/10", text: "text-purple-400", border: "border-purple-500/30" },
  DIAMOND: { bg: "bg-cyan-500/10", text: "text-cyan-400", border: "border-cyan-500/30" },
  PLATINUM: { bg: "bg-teal-500/10", text: "text-teal-400", border: "border-teal-500/30" },
  GOLD: { bg: "bg-yellow-500/10", text: "text-yellow-400", border: "border-yellow-500/30" },
  SILVER: { bg: "bg-zinc-400/10", text: "text-zinc-300", border: "border-zinc-400/30" },
  BRONZE: { bg: "bg-orange-700/10", text: "text-orange-600", border: "border-orange-700/30" },
  IRON: { bg: "bg-zinc-600/10", text: "text-zinc-500", border: "border-zinc-600/30" },
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export const revalidate = 0;

export default async function PlayerProfilePage({ params }: PageProps) {
  const resolvedParams = await params;
  const playerId = resolvedParams.id;

  const { data: player, error: pErr } = await supabase
    .from("players")
    .select("*")
    .or(`id.eq.${playerId},discord_id.eq.${playerId},puuid.eq.${playerId}`)
    .maybeSingle();

  if (pErr || !player) {
    notFound();
  }

  const { data: standings } = await supabase
    .from("standings")
    .select("*, tournaments(name, status, created_at)")
    .eq("player_id", player.id)
    .order("created_at", { ascending: false });

  const { data: matchHistory } = await supabase
    .from("match_player_results")
    .select("*, lobbies(name), tournaments(name)")
    .eq("player_id", player.id)
    .order("created_at", { ascending: false })
    .limit(20);

  const { data: trophies } = await supabase
    .from("trophies")
    .select("*")
    .eq("player_id", player.id)
    .order("awarded_at", { ascending: false });

  // Fetch TFT Rank from Riot API
  const tftRank = player.puuid ? await getTftRankByPuuid(player.puuid) : null;

  let totalGames = 0;
  let totalWins = 0;
  let totalTop4 = 0;

  if (standings) {
    standings.forEach((s) => {
      totalGames += s.games_played;
      totalWins += s.total_wins;
      totalTop4 += s.total_top4;
    });
  }

  const winRate =
    totalGames > 0 ? ((totalWins / totalGames) * 100).toFixed(1) : "0.0";
  const top4Rate =
    totalGames > 0 ? ((totalTop4 / totalGames) * 100).toFixed(1) : "0.0";

  const playerSession = await getPlayerSession();

  return (
    <Sidebar session={playerSession}>
      <div className="p-4 lg:p-8 flex flex-col gap-8 max-w-7xl mx-auto">
        {/* Player Profile Header */}
        <section className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-gradient-to-br from-violet-500/10 via-[#0d0d14] to-cyan-500/10 p-8">
          <div className="absolute top-0 right-0 w-72 h-72 bg-violet-500/10 rounded-full blur-[100px] pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row gap-8 items-center justify-between">
            <div className="flex flex-col items-center md:items-start gap-3">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] px-2 py-0.5 rounded bg-white/[0.04] text-zinc-500 font-mono font-bold uppercase border border-white/[0.06]">
                  TFT Tuyển Thủ
                </span>
                {tftRank && tftRank.tier !== "UNRANKED" && (
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold uppercase border flex items-center gap-1 ${
                      RANK_COLORS[tftRank.tier]?.bg || "bg-zinc-500/10"
                    } ${RANK_COLORS[tftRank.tier]?.text || "text-zinc-400"} ${
                      RANK_COLORS[tftRank.tier]?.border || "border-zinc-500/20"
                    }`}
                  >
                    <Shield className="w-3 h-3" />
                    {tftRank.tier} {tftRank.rank} • {tftRank.lp} LP
                  </span>
                )}
                <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 font-mono font-bold uppercase border border-cyan-500/20">
                  Đã Xác Minh
                </span>
              </div>
              <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-violet-500/30 shadow-[0_0_20px_rgba(139,92,246,0.2)]">
                {player.avatar_url || player.discord_avatar_url ? (
                  <img
                    src={player.avatar_url || player.discord_avatar_url}
                    alt={player.display_name || player.riot_id}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-violet-500/20 text-violet-400 text-2xl font-bold leading-none">
                    {(player.display_name || player.riot_id || "?")[0].toUpperCase()}
                  </div>
                )}
              </div>
              <h1 className="text-3xl font-bold text-white tracking-tight">
                {player.display_name || player.riot_id}
              </h1>
              {player.bio && (
                <p className="text-sm text-zinc-400 max-w-md">
                  {player.bio}
                </p>
              )}
              <p className="text-zinc-500 font-mono text-xs">
                Discord:{" "}
                <span className="text-zinc-300 font-semibold">
                  @{player.discord_id}
                </span>
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full md:w-auto">
              {[
                ...(tftRank && tftRank.tier !== "UNRANKED"
                  ? [{ label: "Rank", value: `${tftRank.tier} ${tftRank.rank}`, color: RANK_COLORS[tftRank.tier]?.text || "text-zinc-400", sub: `${tftRank.lp} LP` }]
                  : []),
                { label: "Trận", value: totalGames, color: "text-white" },
                { label: "Tỷ Lệ Thắng", value: `${winRate}%`, color: "text-violet-400" },
                { label: "Tỷ Lệ Top 4", value: `${top4Rate}%`, color: "text-cyan-400" },
                { label: "Kim Cương", value: player.diamonds || 0, color: "text-cyan-400", icon: true },
              ].slice(0, 4).map((stat) => (
                <div
                  key={stat.label}
                  className="glass-card p-4 flex flex-col items-center justify-center"
                >
                  {stat.icon && <Gem className="w-5 h-5 text-cyan-400 mb-1" />}
                  <span className={`text-2xl font-bold ${stat.color}`}>
                    {stat.value}
                  </span>
                  {(stat as any).sub && (
                    <span className="text-[10px] text-zinc-500 font-mono">
                      {(stat as any).sub}
                    </span>
                  )}
                  <span className="text-[9px] text-zinc-500 font-mono uppercase tracking-wider font-bold">
                    {stat.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Tournaments + Trophies */}
          <section className="lg:col-span-1 flex flex-col gap-6">
            {trophies && trophies.length > 0 && (
              <div>
                <h2 className="text-sm font-mono font-bold text-zinc-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-amber-400" />
                  Thành Tích
                </h2>
                <TrophyCase trophies={trophies} />
              </div>
            )}

            <h2 className="text-sm font-mono font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
              <Swords className="w-4 h-4 text-violet-400" />
              Giải Đấu Đã Tham Gia
            </h2>
            <div className="flex flex-col gap-3">
              {standings && standings.length > 0 ? (
                standings.map((st) => (
                  <Link
                    key={st.id}
                    href={`/tournaments/${st.tournament_id}`}
                    className="glass-card p-4 flex flex-col gap-3 group"
                  >
                    <div className="flex justify-between items-start">
                      <span className="font-bold text-zinc-200 group-hover:text-violet-400 transition-colors line-clamp-1 text-sm">
                        {st.tournaments?.name || "Giải Đấu"}
                      </span>
                      <span
                        className={`text-[9px] font-mono uppercase px-2 py-0.5 rounded font-bold border ${
                          st.tournaments?.status === "active"
                            ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                            : "bg-zinc-500/10 text-zinc-400 border-zinc-500/20"
                        }`}
                      >
                        {st.tournaments?.status === "active"
                          ? "Đang Đấu"
                          : "Kết Thúc"}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                      <div className="flex flex-col bg-white/[0.02] p-2 rounded border border-white/[0.06]">
                        <span className="text-[9px] text-zinc-500 uppercase">
                          Điểm
                        </span>
                        <span className="text-violet-400 font-bold text-sm mt-0.5">
                          {st.total_points}đ
                        </span>
                      </div>
                      <div className="flex flex-col bg-white/[0.02] p-2 rounded border border-white/[0.06]">
                        <span className="text-[9px] text-zinc-500 uppercase">
                          Vị Trí TB
                        </span>
                        <span className="text-zinc-200 font-bold text-sm mt-0.5">
                          {Number(st.avg_placement).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="glass-card p-6 text-center text-zinc-500 text-sm">
                  Chưa tham gia giải đấu nào.
                </div>
              )}
            </div>
          </section>

          {/* Right: Match History */}
          <section className="lg:col-span-2 flex flex-col gap-4">
            <h2 className="text-sm font-mono font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
              <History className="w-4 h-4 text-violet-400" />
              Lịch Sử Trận Đấu Gần Nhất
            </h2>
            <div className="glass-card overflow-hidden">
              {/* Terminal header */}
              <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/[0.06] bg-white/[0.02]">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-[#ff5f56] block" />
                  <span className="w-3 h-3 rounded-full bg-[#ffbd2e] block" />
                  <span className="w-3 h-3 rounded-full bg-[#27c93f] block" />
                </div>
                <span className="text-[10px] font-mono text-zinc-500 tracking-wider">
                  match-history.log
                </span>
                <div className="w-12" />
              </div>

              {matchHistory && matchHistory.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-white/[0.06] bg-white/[0.02] text-[10px] font-mono uppercase text-zinc-500">
                        <th className="py-3 px-4 text-center">Top</th>
                        <th className="py-3 px-4">Giải Đấu</th>
                        <th className="py-3 px-4">Lobby</th>
                        <th className="py-3 px-4 text-center">Điểm</th>
                        <th className="py-3 px-4">Match ID</th>
                        <th className="py-3 px-4">Thời Gian</th>
                      </tr>
                    </thead>
                    <tbody>
                      {matchHistory.map((match) => (
                        <tr
                          key={match.id}
                          className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors"
                        >
                          <td className="py-3 px-4 text-center">
                            <span
                              className={`inline-block w-8 h-7 leading-7 text-center rounded font-bold font-mono text-xs ${
                                match.placement === 1
                                  ? "bg-amber-500/20 text-amber-400"
                                  : match.placement <= 4
                                  ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"
                                  : "bg-white/[0.04] text-zinc-500"
                              }`}
                            >
                              #{match.placement}
                            </span>
                          </td>
                          <td
                            className="py-3 px-4 text-xs text-zinc-200 font-semibold line-clamp-1 max-w-[150px]"
                            title={match.tournaments?.name || "N/A"}
                          >
                            {match.tournaments?.name || "N/A"}
                          </td>
                          <td className="py-3 px-4 text-xs text-zinc-400 font-mono">
                            {match.lobbies?.name || "N/A"}
                          </td>
                          <td className="py-3 px-4 text-center text-violet-400 font-bold font-mono">
                            +{match.points}
                          </td>
                          <td
                            className="py-3 px-4 text-[10px] text-zinc-500 font-mono truncate max-w-[120px]"
                            title={match.match_id}
                          >
                            {match.match_id}
                          </td>
                          <td className="py-3 px-4 text-[10px] text-zinc-400 font-mono">
                            {new Date(match.created_at).toLocaleDateString(
                              "vi-VN"
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-10 text-center text-zinc-500 text-sm">
                  Chưa có lịch sử thi đấu.
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </Sidebar>
  );
}
