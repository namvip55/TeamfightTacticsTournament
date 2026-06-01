import { notFound } from "next/navigation";
import { supabase } from "../../lib/supabase";
import { getPlayerSession } from "../../lib/player-auth";
import Sidebar from "../../components/Sidebar";
import TournamentDetailClient from "./TournamentDetailClient";
import {
  Crown,
  Calendar,
  Users,
  Gamepad2,
  Trophy,
  Radio,
  Swords,
} from "lucide-react";

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string }>;
}

export const revalidate = 0;

export default async function TournamentDetailPage({
  params,
  searchParams,
}: PageProps) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const tournamentId = resolvedParams.id;
  const activeTab = resolvedSearchParams.tab || "standings";

  const { data: tournament, error: tErr } = await supabase
    .from("tournaments")
    .select("*")
    .eq("id", tournamentId)
    .maybeSingle();

  if (tErr || !tournament) {
    notFound();
  }

  const { data: lobbies } = await supabase
    .from("lobbies")
    .select("*")
    .eq("tournament_id", tournamentId)
    .order("created_at", { ascending: true });

  const { data: standings } = await supabase
    .from("standings")
    .select("*")
    .eq("tournament_id", tournamentId)
    .order("total_points", { ascending: false })
    .order("avg_placement", { ascending: true });

  const { data: lobbyPlayers } = await supabase
    .from("lobby_players")
    .select("*")
    .eq("tournament_id", tournamentId)
    .order("created_at", { ascending: true });

  const { data: matchResults } = await supabase
    .from("match_results")
    .select("*")
    .eq("tournament_id", tournamentId)
    .order("created_at", { ascending: false });

  const { data: matchPlayerResults } = await supabase
    .from("match_player_results")
    .select("*")
    .eq("tournament_id", tournamentId)
    .order("placement", { ascending: true });

  const totalPlayers = lobbyPlayers?.length || 0;
  const totalLobbies = lobbies?.length || 0;
  const playerSession = await getPlayerSession();

  return (
    <Sidebar session={playerSession}>
      <div className="p-4 lg:p-8 flex flex-col gap-6 max-w-7xl mx-auto">
        {/* Winner Banner */}
        {tournament.status === "finished" && tournament.winner_riot_id && (
          <section className="relative overflow-hidden rounded-xl border border-amber-500/20 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent p-6 flex items-center gap-6">
            <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/10 rounded-full blur-[80px] pointer-events-none" />
            <div className="relative z-10 w-14 h-14 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
              <Crown className="w-7 h-7 text-amber-400" />
            </div>
            <div className="relative z-10 flex flex-col gap-1">
              <span className="text-[10px] font-mono text-amber-400 uppercase tracking-widest font-bold">
                Nhà Vô Địch
              </span>
              <h2 className="text-2xl font-bold text-white">
                {tournament.winner_riot_id}
              </h2>
              <p className="text-xs text-zinc-500 font-mono">
                Giải đấu đã kết thúc
                {tournament.finished_at
                  ? ` • ${new Date(tournament.finished_at).toLocaleDateString("vi-VN")}`
                  : ""}
              </p>
            </div>
          </section>
        )}

        {/* Tournament Meta */}
        <section className="glass-card p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3 flex-wrap">
              <span
                className={`inline-flex items-center gap-1.5 text-[9px] font-mono px-2.5 py-1 rounded-full font-bold uppercase border ${
                  tournament.status === "registration_open"
                    ? "bg-green-500/10 text-green-400 border-green-500/20"
                    : tournament.status === "active"
                    ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                    : "bg-zinc-500/10 text-zinc-400 border-zinc-500/20"
                }`}
              >
                <Radio className="w-3 h-3" />
                {tournament.status === "registration_open"
                  ? "Mở Đăng Ký"
                  : tournament.status === "active"
                  ? "Đang Diễn Ra"
                  : "Đã Kết Thúc"}
              </span>
              {tournament.mode === "checkmate" && (
                <span className="text-[9px] font-mono px-2.5 py-1 rounded-full font-bold uppercase border bg-rose-500/10 text-rose-400 border-rose-500/20 flex items-center gap-1">
                  <Swords className="w-3 h-3" />
                  CHECKMATE ({tournament.checkmate_score || 20}đ)
                </span>
              )}
              <span className="text-[10px] text-zinc-600 font-mono">
                ID: {tournament.id.slice(0, 8)}...
              </span>
            </div>
            <h1 className="text-3xl font-bold text-white tracking-tight">
              {tournament.name}
            </h1>
          </div>

          <div className="flex flex-col gap-2 text-xs font-mono bg-white/[0.02] p-4 rounded-lg border border-white/[0.06] sm:min-w-[200px]">
            <div>
              <span className="text-zinc-500 block text-[9px] uppercase tracking-wider mb-0.5">
                Đăng Ký
              </span>
              <span
                className={
                  tournament.registration_open
                    ? "text-green-400 font-bold"
                    : "text-rose-400 font-bold"
                }
              >
                {tournament.registration_open ? "● Đang Mở" : "○ Đã Khóa"}
              </span>
            </div>
            <div className="mt-1 pt-1.5 border-t border-white/[0.06]">
              <span className="text-zinc-500 block text-[9px] uppercase tracking-wider mb-0.5">
                Quy Mô
              </span>
              <span className="text-zinc-200 font-bold">
                {totalLobbies} Lobby • {totalPlayers} Tuyển Thủ
              </span>
            </div>
          </div>
        </section>

        {/* Client Tabs */}
        <TournamentDetailClient
          tournament={tournament}
          lobbies={lobbies || []}
          standings={standings || []}
          lobbyPlayers={lobbyPlayers || []}
          matchResults={matchResults || []}
          matchPlayerResults={matchPlayerResults || []}
          initialTab={activeTab}
        />
      </div>
    </Sidebar>
  );
}
