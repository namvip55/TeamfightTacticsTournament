import Link from "next/link";
import { supabase } from "../lib/supabase";
import { getPlayerSession } from "../lib/player-auth";
import Sidebar from "../components/Sidebar";
import {
  Users,
  BarChart3,
  Swords,
  Trophy,
  Crown,
  Medal,
  Award,
} from "lucide-react";

export const revalidate = 0;

export default async function PlayersPage() {
  const [
    { data: players },
    { data: standings }
  ] = await Promise.all([
    supabase.from("players").select("*").order("created_at", { ascending: false }),
    supabase.from("standings").select("*, tournaments(name, status)").order("total_points", { ascending: false })
  ]);

  const standingsByPlayer: Record<string, any[]> = {};
  if (standings) {
    for (const s of standings) {
      if (!standingsByPlayer[s.player_id]) {
        standingsByPlayer[s.player_id] = [];
      }
      standingsByPlayer[s.player_id].push(s);
    }
  }

  const playersWithStats = (players || []).map((player) => {
    const playerStandings = standingsByPlayer[player.id] || [];
    let totalGames = 0;
    let totalWins = 0;
    let totalTop4 = 0;
    let totalPoints = 0;
    const tournaments: string[] = [];

    for (const s of playerStandings) {
      totalGames += s.games_played;
      totalWins += s.total_wins;
      totalTop4 += s.total_top4;
      totalPoints += s.total_points;
      if (s.tournaments?.name) tournaments.push(s.tournaments.name);
    }

    return {
      ...player,
      totalGames,
      totalWins,
      totalTop4,
      totalPoints,
      tournaments,
      tournamentCount: playerStandings.length,
      winRate:
        totalGames > 0
          ? ((totalWins / totalGames) * 100).toFixed(1)
          : "0.0",
      top4Rate:
        totalGames > 0
          ? ((totalTop4 / totalGames) * 100).toFixed(1)
          : "0.0",
    };
  });

  playersWithStats.sort((a, b) => b.totalPoints - a.totalPoints);

  const playerSession = await getPlayerSession();

  return (
    <Sidebar session={playerSession}>
      <div className="p-4 lg:p-8 flex flex-col gap-8 max-w-7xl mx-auto">
        {/* Page Header */}
        <section className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-3">
            <Users className="w-6 h-6 text-violet-400" />
            Danh Sách Tuyển Thủ
          </h1>
          <p className="text-sm text-zinc-500">
            Tất cả {players?.length || 0} tuyển thủ đã đăng ký.
          </p>
        </section>

        {/* Stats Summary */}
        <section className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            {
              label: "Tổng Tuyển Thủ",
              value: players?.length || 0,
              icon: Users,
              color: "text-violet-400",
            },
            {
              label: "Đã Thi Đấu",
              value: playersWithStats.filter((p) => p.totalGames > 0).length,
              icon: BarChart3,
              color: "text-cyan-400",
            },
            {
              label: "Tổng Trận Đấu",
              value: playersWithStats.reduce(
                (sum, p) => sum + p.totalGames,
                0
              ),
              icon: Swords,
              color: "text-amber-400",
            },
            {
              label: "Có Top 1",
              value: playersWithStats.filter((p) => p.totalWins > 0).length,
              icon: Crown,
              color: "text-green-400",
            },
          ].map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="glass-card p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Icon className={`w-4 h-4 ${stat.color}`} />
                  <span className="text-[10px] text-zinc-500 font-mono uppercase tracking-wider font-bold">
                    {stat.label}
                  </span>
                </div>
                <span className={`text-2xl font-bold ${stat.color}`}>
                  {stat.value}
                </span>
              </div>
            );
          })}
        </section>

        {/* Players Grid */}
        {playersWithStats.length > 0 ? (
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {playersWithStats.map((player, index) => (
              <Link
                key={player.id}
                href={`/player/${player.id}`}
                className="glass-card p-5 flex flex-col gap-3 group"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {index < 3 && (
                        <span>
                          {index === 0 ? (
                            <Crown className="w-4 h-4 text-amber-400" />
                          ) : index === 1 ? (
                            <Medal className="w-4 h-4 text-zinc-300" />
                          ) : (
                            <Award className="w-4 h-4 text-amber-600" />
                          )}
                        </span>
                      )}
                      <h3 className="font-bold text-zinc-200 text-base truncate group-hover:text-violet-400 transition-colors">
                        {player.riot_id}
                      </h3>
                    </div>
                    <p className="text-[10px] text-zinc-500 font-mono truncate">
                      @{player.discord_username || player.discord_id}
                    </p>
                  </div>
                  {player.totalPoints > 0 && (
                    <span className="text-lg font-bold text-violet-400">
                      {player.totalPoints}đ
                    </span>
                  )}
                </div>

                {player.totalGames > 0 ? (
                  <div className="grid grid-cols-3 gap-2">
                    <div className="bg-white/[0.02] border border-white/[0.06] p-2 rounded text-center">
                      <span className="block text-sm font-bold text-zinc-200 font-mono">
                        {player.totalGames}
                      </span>
                      <span className="text-[8px] text-zinc-500 font-mono uppercase">
                        Trận
                      </span>
                    </div>
                    <div className="bg-white/[0.02] border border-white/[0.06] p-2 rounded text-center">
                      <span className="block text-sm font-bold text-violet-400 font-mono">
                        {player.winRate}%
                      </span>
                      <span className="text-[8px] text-zinc-500 font-mono uppercase">
                        Thắng
                      </span>
                    </div>
                    <div className="bg-white/[0.02] border border-white/[0.06] p-2 rounded text-center">
                      <span className="block text-sm font-bold text-cyan-400 font-mono">
                        {player.top4Rate}%
                      </span>
                      <span className="text-[8px] text-zinc-500 font-mono uppercase">
                        Top 4
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="text-[10px] text-zinc-600 font-mono text-center py-2 bg-white/[0.02] rounded border border-white/[0.06]">
                    Chưa thi đấu trận nào
                  </div>
                )}

                {player.tournaments.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {player.tournaments
                      .slice(0, 2)
                      .map((tName: string, i: number) => (
                        <span
                          key={i}
                          className="text-[9px] px-2 py-0.5 bg-white/[0.04] text-zinc-500 border border-white/[0.06] rounded font-mono truncate max-w-[120px]"
                        >
                          {tName}
                        </span>
                      ))}
                    {player.tournaments.length > 2 && (
                      <span className="text-[9px] px-2 py-0.5 text-zinc-600 font-mono">
                        +{player.tournaments.length - 2}
                      </span>
                    )}
                  </div>
                )}
              </Link>
            ))}
          </section>
        ) : (
          <div className="glass-card p-12 text-center">
            <Users className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
            <p className="text-zinc-500">Chưa có tuyển thủ nào đăng ký.</p>
            <Link
              href="/admin"
              className="inline-block mt-4 px-5 py-2.5 bg-violet-600 hover:bg-violet-500 text-white font-semibold rounded-lg transition-colors text-sm"
            >
              Tạo Giải Đấu
            </Link>
          </div>
        )}
      </div>
    </Sidebar>
  );
}
