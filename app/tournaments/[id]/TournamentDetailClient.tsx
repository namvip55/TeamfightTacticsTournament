"use client";

import { useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  BarChart3,
  Gamepad2,
  Users,
  Swords,
  Trophy,
  Crown,
  Medal,
  Award,
  ChevronRight,
  Filter,
  CheckCircle2,
  Clock,
  Zap,
} from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

interface StandingsRow {
  id: string;
  tournament_id: string;
  player_id: string;
  discord_id: string;
  riot_id: string;
  puuid: string;
  total_points: number;
  games_played: number;
  total_wins: number;
  total_top4: number;
  total_placement: number;
  avg_placement: number;
  updated_at: string;
}

interface LobbyPlayer {
  id: string;
  tournament_id: string;
  lobby_id: string;
  player_id: string;
  discord_id: string;
  riot_id: string;
  puuid: string;
  placement: number | null;
  points: number;
  match_id: string | null;
  verified: boolean;
  created_at: string;
}

interface Lobby {
  id: string;
  tournament_id: string;
  name: string;
  status: string;
}

interface Tournament {
  id: string;
  name: string;
  status: string;
  registration_open: boolean;
  locked: boolean;
  mode?: string;
  checkmate_score?: number;
  winner_riot_id?: string;
  winner_discord_id?: string;
}

interface MatchResult {
  id: string;
  tournament_id: string;
  lobby_id: string;
  match_id: string;
  created_at: string;
}

interface MatchPlayerResult {
  id: string;
  tournament_id: string;
  lobby_id: string;
  match_result_id: string;
  match_id: string;
  player_id: string;
  discord_id: string;
  riot_id: string;
  puuid: string;
  placement: number;
  points: number;
  verified: boolean;
  created_at: string;
}

interface ClientProps {
  tournament: Tournament;
  lobbies: Lobby[];
  standings: StandingsRow[];
  lobbyPlayers: LobbyPlayer[];
  matchResults: MatchResult[];
  matchPlayerResults: MatchPlayerResult[];
  initialTab: string;
}

export default function TournamentDetailClient({
  tournament,
  lobbies,
  standings,
  lobbyPlayers,
  matchResults,
  matchPlayerResults,
  initialTab,
}: ClientProps) {
  const [tab, setTab] = useState(initialTab);
  const [selectedLobbyFilter, setSelectedLobbyFilter] = useState<string>("all");

  const getRankBadge = (rank: number) => {
    if (rank === 1)
      return <Crown className="w-5 h-5 text-amber-400" />;
    if (rank === 2)
      return <Medal className="w-5 h-5 text-zinc-300" />;
    if (rank === 3)
      return <Award className="w-5 h-5 text-amber-600" />;
    return (
      <span className="text-zinc-500 font-mono text-xs w-5 text-center">
        #{rank}
      </span>
    );
  };

  const checkmatePlayers =
    tournament.mode === "checkmate"
      ? standings.filter(
          (s) => s.total_points >= (tournament.checkmate_score || 20)
        )
      : [];

  const filteredLobbyPlayers =
    selectedLobbyFilter === "all"
      ? lobbyPlayers
      : lobbyPlayers.filter((lp) => lp.lobby_id === selectedLobbyFilter);

  return (
    <Tabs value={tab} onValueChange={setTab} className="w-full">
      <TabsList className="bg-white/[0.03] border border-white/[0.08] p-1 h-auto flex-wrap">
        <TabsTrigger
          value="standings"
          className="data-[state=active]:bg-violet-500/10 data-[state=active]:text-violet-400 data-[state=active]:border-violet-500/20 text-zinc-400 border border-transparent px-4 py-2 text-xs font-mono font-bold rounded-lg"
        >
          <BarChart3 className="w-3.5 h-3.5 mr-1.5" />
          Bảng Xếp Hạng
        </TabsTrigger>
        <TabsTrigger
          value="lobbies"
          className="data-[state=active]:bg-violet-500/10 data-[state=active]:text-violet-400 data-[state=active]:border-violet-500/20 text-zinc-400 border border-transparent px-4 py-2 text-xs font-mono font-bold rounded-lg"
        >
          <Gamepad2 className="w-3.5 h-3.5 mr-1.5" />
          Lobbies ({lobbies.length})
        </TabsTrigger>
        <TabsTrigger
          value="players"
          className="data-[state=active]:bg-violet-500/10 data-[state=active]:text-violet-400 data-[state=active]:border-violet-500/20 text-zinc-400 border border-transparent px-4 py-2 text-xs font-mono font-bold rounded-lg"
        >
          <Users className="w-3.5 h-3.5 mr-1.5" />
          Tuyển Thủ ({lobbyPlayers.length})
        </TabsTrigger>
        <TabsTrigger
          value="matches"
          className="data-[state=active]:bg-violet-500/10 data-[state=active]:text-violet-400 data-[state=active]:border-violet-500/20 text-zinc-400 border border-transparent px-4 py-2 text-xs font-mono font-bold rounded-lg"
        >
          <Trophy className="w-3.5 h-3.5 mr-1.5" />
          Trận Đấu ({matchResults.length})
        </TabsTrigger>
        {tournament.mode === "checkmate" && (
          <TabsTrigger
            value="checkmate"
            className="data-[state=active]:bg-rose-500/10 data-[state=active]:text-rose-400 data-[state=active]:border-rose-500/20 text-zinc-400 border border-transparent px-4 py-2 text-xs font-mono font-bold rounded-lg"
          >
            <Swords className="w-3.5 h-3.5 mr-1.5" />
            Checkmate
          </TabsTrigger>
        )}
      </TabsList>

      {/* STANDINGS */}
      <TabsContent value="standings" className="mt-4">
        <div className="glass-card overflow-hidden">
          {/* Terminal header */}
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/[0.06] bg-white/[0.02]">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-[#ff5f56] block" />
              <span className="w-3 h-3 rounded-full bg-[#ffbd2e] block" />
              <span className="w-3 h-3 rounded-full bg-[#27c93f] block" />
            </div>
            <span className="text-[10px] font-mono text-zinc-500 tracking-wider">
              tft-standings.sh
            </span>
            <div className="w-12" />
          </div>

          {standings.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/[0.06] bg-white/[0.02] text-[10px] font-mono uppercase text-zinc-500">
                    <th className="py-3 px-5 text-center">Hạng</th>
                    <th className="py-3 px-5">Cờ Thủ</th>
                    <th className="py-3 px-5 text-center">Trận</th>
                    <th className="py-3 px-5 text-center text-violet-400 font-bold">
                      Điểm
                    </th>
                    <th className="py-3 px-5 text-center">Vị Trí TB</th>
                    <th className="py-3 px-5 text-center">Top 1</th>
                    <th className="py-3 px-5 text-center">Top 4</th>
                    <th className="py-3 px-5 text-center">Tỷ Lệ Top 4</th>
                  </tr>
                </thead>
                <tbody>
                  {standings.map((row, index) => {
                    const rank = index + 1;
                    const top4Rate =
                      row.games_played > 0
                        ? ((row.total_top4 / row.games_played) * 100).toFixed(0)
                        : "0";
                    const isCheckmateReady =
                      tournament.mode === "checkmate" &&
                      row.total_points >= (tournament.checkmate_score || 20);

                    return (
                      <tr
                        key={row.id}
                        className={cn(
                          "border-b border-white/[0.03] hover:bg-white/[0.03] transition-colors",
                          rank === 1 && "bg-amber-500/[0.03]",
                          isCheckmateReady && "bg-rose-500/[0.03]"
                        )}
                      >
                        <td className="py-3 px-5 text-center font-bold">
                          {getRankBadge(rank)}
                        </td>
                        <td className="py-3 px-5">
                          <div className="flex items-center gap-2">
                            <Link
                              href={`/player/${row.player_id}`}
                              className={cn(
                                "font-semibold text-sm hover:text-violet-400 transition-colors",
                                rank === 1 ? "text-amber-400" : "text-zinc-200"
                              )}
                            >
                              {row.riot_id}
                            </Link>
                            {isCheckmateReady && (
                              <span className="text-[9px] px-1.5 py-0.5 bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded font-mono font-bold">
                                CHECKMATE
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-zinc-500 font-mono block mt-0.5">
                            @{row.discord_id}
                          </span>
                        </td>
                        <td className="py-3 px-5 text-center font-mono text-zinc-300 text-sm">
                          {row.games_played}
                        </td>
                        <td className="py-3 px-5 text-center font-mono text-violet-400 font-bold text-lg">
                          {row.total_points}
                        </td>
                        <td className="py-3 px-5 text-center font-mono text-zinc-300 text-sm">
                          {Number(row.avg_placement).toFixed(2)}
                        </td>
                        <td className="py-3 px-5 text-center font-mono text-zinc-300 text-sm">
                          {row.total_wins}
                        </td>
                        <td className="py-3 px-5 text-center font-mono text-zinc-300 text-sm">
                          {row.total_top4}
                        </td>
                        <td className="py-3 px-5 text-center">
                          <span
                            className={cn(
                              "px-2 py-0.5 rounded font-mono text-xs font-semibold",
                              Number(top4Rate) >= 75
                                ? "bg-green-500/10 text-green-400 border border-green-500/20"
                                : Number(top4Rate) >= 50
                                ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"
                                : "bg-white/[0.04] text-zinc-400 border border-white/[0.06]"
                            )}
                          >
                            {top4Rate}%
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-12 text-center flex flex-col items-center justify-center gap-4 text-zinc-500">
              <BarChart3 className="w-10 h-10 text-zinc-600" />
              <p className="text-sm">Chưa có kết quả điểm số nào.</p>
            </div>
          )}
        </div>
      </TabsContent>

      {/* LOBBIES */}
      <TabsContent value="lobbies" className="mt-4">
        <div className="flex flex-col gap-6">
          {lobbies.map((lobby) => {
            const playersInLobby = lobbyPlayers.filter(
              (lp) => lp.lobby_id === lobby.id
            );
            const sortedPlayers = [...playersInLobby].sort((a, b) => {
              if (a.placement === null) return 1;
              if (b.placement === null) return -1;
              return a.placement - b.placement;
            });
            const isScored = playersInLobby.some((p) => p.placement !== null);
            const sampleMatchId = playersInLobby.find(
              (p) => p.match_id !== null
            )?.match_id;

            return (
              <div
                key={lobby.id}
                className="glass-card overflow-hidden flex flex-col"
              >
                {/* Terminal header */}
                <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/[0.06] bg-white/[0.02]">
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-[#ff5f56] block" />
                    <span className="w-3 h-3 rounded-full bg-[#ffbd2e] block" />
                    <span className="w-3 h-3 rounded-full bg-[#27c93f] block" />
                  </div>
                  <span className="text-[10px] font-mono text-zinc-500 tracking-wider">
                    {lobby.name.toLowerCase().replace(" ", "-")}.log
                  </span>
                  <div className="w-12" />
                </div>

                <div className="p-5 flex flex-col gap-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                        <Gamepad2 className="w-4 h-4 text-violet-400" />
                        {lobby.name}
                      </h3>
                      <p className="text-xs text-zinc-500 font-mono">
                        {playersInLobby.length}/8 Tuyển thủ
                      </p>
                    </div>
                    {isScored && sampleMatchId ? (
                      <div className="flex flex-col sm:items-end gap-1 font-mono">
                        <span className="text-[10px] px-2 py-0.5 rounded bg-green-500/10 text-green-400 border border-green-500/20 w-max font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          {sampleMatchId.startsWith("MANUAL_")
                            ? "KẾT QUẢ THỦ CÔNG"
                            : "RIOT API XÁC MINH"}
                        </span>
                        <span
                          className="text-[10px] text-zinc-500 truncate max-w-[200px]"
                          title={sampleMatchId}
                        >
                          Match: {sampleMatchId}
                        </span>
                      </div>
                    ) : (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/[0.04] text-zinc-500 border border-white/[0.06] w-max uppercase font-bold flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Đang chờ kết quả
                      </span>
                    )}
                  </div>

                  <div className="h-px bg-white/[0.06]" />

                  {playersInLobby.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                      {sortedPlayers.map((player) => (
                        <Link
                          key={player.id}
                          href={`/player/${player.player_id}`}
                          className={cn(
                            "p-3 rounded-lg border flex flex-col gap-2 transition-all hover:scale-[1.02]",
                            player.placement === 1
                              ? "bg-amber-500/[0.07] border-amber-500/30"
                              : player.placement && player.placement <= 4
                              ? "bg-cyan-500/[0.05] border-cyan-500/20"
                              : "bg-white/[0.02] border-white/[0.06]"
                          )}
                        >
                          <div className="flex items-start justify-between">
                            <span className="font-bold text-sm text-zinc-200 line-clamp-1">
                              {player.riot_id}
                            </span>
                            {player.placement !== null ? (
                              <span
                                className={cn(
                                  "text-[10px] font-mono font-bold px-2 py-0.5 rounded",
                                  player.placement === 1
                                    ? "bg-amber-500/20 text-amber-400"
                                    : player.placement <= 4
                                    ? "bg-cyan-500/10 text-cyan-400"
                                    : "bg-white/[0.04] text-zinc-500"
                                )}
                              >
                                Top {player.placement}
                              </span>
                            ) : (
                              <span className="text-[10px] font-mono text-zinc-600">
                                Chờ
                              </span>
                            )}
                          </div>
                          <div className="flex items-center justify-between font-mono text-[11px]">
                            <span className="text-zinc-500 truncate max-w-[100px]">
                              @{player.discord_id}
                            </span>
                            <span className="font-bold text-violet-400">
                              {player.placement !== null
                                ? `+${player.points}đ`
                                : "0đ"}
                            </span>
                          </div>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-zinc-500 text-center py-4 font-mono">
                      Lobby chưa có tuyển thủ.
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </TabsContent>

      {/* PLAYERS */}
      <TabsContent value="players" className="mt-4">
        <div className="glass-card p-5 flex flex-col gap-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-violet-400" />
                Tuyển Thủ Đăng Ký ({lobbyPlayers.length})
              </h3>
              <p className="text-xs text-zinc-500 font-mono">
                Danh sách tất cả tuyển thủ trong giải đấu.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-3.5 h-3.5 text-zinc-500" />
              <select
                value={selectedLobbyFilter}
                onChange={(e) => setSelectedLobbyFilter(e.target.value)}
                className="bg-white/[0.03] border border-white/[0.08] rounded-lg px-3 py-1.5 text-xs font-mono text-zinc-300 cursor-pointer focus:border-violet-500/50 focus:outline-none"
              >
                <option value="all">Tất cả</option>
                {lobbies.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="h-px bg-white/[0.06]" />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 font-mono text-xs">
            {filteredLobbyPlayers.map((player) => {
              const lobby = lobbies.find((l) => l.id === player.lobby_id);
              return (
                <Link
                  key={player.id}
                  href={`/player/${player.player_id}`}
                  className="p-3 rounded-lg border border-white/[0.06] bg-white/[0.02] hover:border-violet-500/30 transition-colors flex flex-col gap-1.5 group"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-zinc-200 text-sm line-clamp-1 group-hover:text-violet-400 transition-colors">
                      {player.riot_id}
                    </span>
                    {player.placement !== null && (
                      <span
                        className={cn(
                          "text-[10px] font-mono font-bold px-1.5 py-0.5 rounded",
                          player.placement === 1
                            ? "bg-amber-500/20 text-amber-400"
                            : player.placement <= 4
                            ? "bg-cyan-500/10 text-cyan-400"
                            : "bg-white/[0.04] text-zinc-500"
                        )}
                      >
                        #{player.placement}
                      </span>
                    )}
                  </div>
                  <span className="text-zinc-500 text-[10px]">
                    @{player.discord_id}
                  </span>
                  <div className="flex items-center justify-between pt-1 border-t border-white/[0.04]">
                    <span className="text-[10px] text-zinc-600">
                      {lobby?.name || "N/A"}
                    </span>
                    <span className="text-[10px] text-violet-400 font-bold">
                      {player.placement !== null ? `${player.points}đ` : "—"}
                    </span>
                  </div>
                </Link>
              );
            })}
            {filteredLobbyPlayers.length === 0 && (
              <div className="col-span-full p-6 text-center text-zinc-500 text-xs">
                Chưa có tuyển thủ nào.
              </div>
            )}
          </div>
        </div>
      </TabsContent>

      {/* MATCHES */}
      <TabsContent value="matches" className="mt-4">
        <div className="flex flex-col gap-4">
          {matchResults.length > 0 ? (
            matchResults.map((mr) => {
              const lobby = lobbies.find((l) => l.id === mr.lobby_id);
              const players = matchPlayerResults
                .filter((mpr) => mpr.match_id === mr.match_id)
                .sort((a, b) => a.placement - b.placement);

              return (
                <div key={mr.id} className="glass-card overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/[0.06] bg-white/[0.02]">
                    <div className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded-full bg-[#ff5f56] block" />
                      <span className="w-3 h-3 rounded-full bg-[#ffbd2e] block" />
                      <span className="w-3 h-3 rounded-full bg-[#27c93f] block" />
                    </div>
                    <span className="text-[10px] font-mono text-zinc-500 tracking-wider">
                      match-{mr.match_id.slice(0, 16)}.log
                    </span>
                    <div className="w-12" />
                  </div>

                  <div className="p-5 flex flex-col gap-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <span className="font-mono font-bold text-sm text-zinc-200">
                          {mr.match_id}
                        </span>
                        <span className="text-[10px] text-zinc-500 font-mono">
                          {lobby?.name || "N/A"} •{" "}
                          {new Date(mr.created_at).toLocaleString("vi-VN")}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-green-500/10 text-green-400 border border-green-500/20 font-bold flex items-center gap-1 w-fit">
                        <Zap className="w-3 h-3" />
                        {mr.match_id.startsWith("MANUAL_")
                          ? "THỦ CÔNG"
                          : "RIOT API"}
                      </span>
                    </div>

                    {players.length > 0 ? (
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {players.map((p) => (
                          <Link
                            key={p.id}
                            href={`/player/${p.player_id}`}
                            className={cn(
                              "p-3 rounded-lg border flex flex-col gap-1 transition-all hover:scale-[1.02]",
                              p.placement === 1
                                ? "bg-amber-500/[0.07] border-amber-500/30"
                                : p.placement <= 4
                                ? "bg-cyan-500/[0.05] border-cyan-500/20"
                                : "bg-white/[0.02] border-white/[0.06]"
                            )}
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-xs text-zinc-200 truncate max-w-[100px]">
                                {p.riot_id}
                              </span>
                              <span
                                className={cn(
                                  "text-[10px] font-mono font-bold px-1.5 py-0.5 rounded",
                                  p.placement === 1
                                    ? "bg-amber-500/20 text-amber-400"
                                    : p.placement <= 4
                                    ? "bg-cyan-500/10 text-cyan-400"
                                    : "text-zinc-500"
                                )}
                              >
                                #{p.placement}
                              </span>
                            </div>
                            <span className="text-violet-400 font-bold font-mono text-xs">
                              +{p.points}đ
                            </span>
                          </Link>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-zinc-500 font-mono text-center py-3">
                        Không có dữ liệu chi tiết trận đấu.
                      </p>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="glass-card p-10 text-center text-zinc-500 text-sm">
              Chưa có kết quả trận đấu nào.
            </div>
          )}
        </div>
      </TabsContent>

      {/* CHECKMATE */}
      {tournament.mode === "checkmate" && (
        <TabsContent value="checkmate" className="mt-4">
          <div className="flex flex-col gap-6">
            {/* Checkmate Rules */}
            <div className="glass-card p-6 flex flex-col gap-4 border-rose-500/20">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center">
                  <Swords className="w-6 h-6 text-rose-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">
                    Chế Độ Checkmate
                  </h3>
                  <p className="text-xs text-zinc-500 font-mono">
                    Mốc điểm:{" "}
                    <span className="text-rose-400 font-bold">
                      {tournament.checkmate_score || 20} điểm
                    </span>
                  </p>
                </div>
              </div>
              <div className="text-xs text-zinc-400 leading-relaxed bg-white/[0.02] p-4 rounded-lg border border-white/[0.06]">
                <p className="mb-2 font-bold text-zinc-300">Luật chơi:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>
                    Khi tuyển thủ đạt{" "}
                    <span className="text-rose-400 font-bold">
                      {tournament.checkmate_score || 20} điểm
                    </span>{" "}
                    trước một ván đấu, họ bước vào trạng thái{" "}
                    <span className="text-rose-400 font-bold">Checkmate</span>.
                  </li>
                  <li>
                    Người trong trạng thái Checkmate cần giành{" "}
                    <span className="text-amber-400 font-bold">Top 1</span> ở
                    ván tiếp theo để{" "}
                    <span className="text-amber-400 font-bold">
                      vô địch giải đấu
                    </span>
                    .
                  </li>
                  <li>
                    Nếu có nhiều người cùng Checkmate, ai giành Top 1 trước sẽ
                    thắng.
                  </li>
                </ul>
              </div>
            </div>

            {/* Checkmate Status */}
            {tournament.status === "finished" &&
            tournament.winner_riot_id ? (
              <div className="relative overflow-hidden rounded-xl border border-amber-500/20 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent p-8 text-center">
                <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-[100px] pointer-events-none" />
                <Crown className="w-16 h-16 text-amber-400 mx-auto mb-4" />
                <h2 className="text-3xl font-bold text-white mb-2">
                  {tournament.winner_riot_id}
                </h2>
                <p className="text-sm text-zinc-500 font-mono">
                  Nhà vô địch giải đấu Checkmate!
                </p>
              </div>
            ) : (
              <>
                {/* Players in Checkmate */}
                <div className="glass-card p-5">
                  <h4 className="text-sm font-mono font-bold text-rose-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <Swords className="w-4 h-4" />
                    Tuyển Thủ Đang Checkmate ({checkmatePlayers.length})
                  </h4>
                  {checkmatePlayers.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {checkmatePlayers.map((p) => (
                        <div
                          key={p.id}
                          className="p-4 rounded-lg border border-rose-500/20 bg-rose-500/[0.05] flex items-center justify-between"
                        >
                          <div>
                            <Link
                              href={`/player/${p.player_id}`}
                              className="font-bold text-sm text-zinc-200 hover:text-violet-400 transition-colors"
                            >
                              {p.riot_id}
                            </Link>
                            <span className="block text-[10px] text-zinc-500 font-mono mt-0.5">
                              {p.total_points} điểm • {p.games_played} trận
                            </span>
                          </div>
                          <span className="text-xs font-mono font-bold text-rose-400 px-2 py-1 bg-rose-500/10 border border-rose-500/20 rounded">
                            CHECKMATE
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-zinc-500 font-mono text-center py-4">
                      Chưa có tuyển thủ nào đạt mốc{" "}
                      {tournament.checkmate_score || 20} điểm.
                    </p>
                  )}
                </div>

                {/* Progress */}
                <div className="glass-card p-5">
                  <h4 className="text-sm font-mono font-bold text-zinc-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-violet-400" />
                    Tiến Trình Điểm Số
                  </h4>
                  <div className="flex flex-col gap-3">
                    {standings.map((p) => {
                      const threshold = tournament.checkmate_score || 20;
                      const progress = Math.min(
                        100,
                        (p.total_points / threshold) * 100
                      );
                      const isInCheckmate = p.total_points >= threshold;

                      return (
                        <div key={p.id} className="flex items-center gap-3">
                          <span className="text-xs font-mono font-bold text-zinc-300 w-[140px] truncate">
                            {p.riot_id}
                          </span>
                          <div className="flex-1 bg-white/[0.04] rounded-full h-3 border border-white/[0.06] overflow-hidden">
                            <div
                              className={cn(
                                "h-full rounded-full transition-all",
                                isInCheckmate
                                  ? "bg-gradient-to-r from-rose-500 to-rose-400"
                                  : "bg-gradient-to-r from-violet-500 to-cyan-500"
                              )}
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                          <span
                            className={cn(
                              "text-xs font-mono font-bold w-[60px] text-right",
                              isInCheckmate ? "text-rose-400" : "text-zinc-300"
                            )}
                          >
                            {p.total_points}/{threshold}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </>
            )}
          </div>
        </TabsContent>
      )}
    </Tabs>
  );
}
