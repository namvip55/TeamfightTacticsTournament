import { notFound } from "next/navigation";
import { supabase } from "../../lib/supabase";
import { getPlayerSession } from "../../lib/player-auth";
import { getTftRankByPuuid } from "../../lib/actions";
import Sidebar from "../../components/Sidebar";
import PublicPlayerWrapper from "./PublicPlayerWrapper";

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

  const [{ data: player, error: pErr }, playerSession] = await Promise.all([
    supabase
      .from("players")
      .select("*")
      .or(`id.eq.${playerId},discord_id.eq.${playerId},puuid.eq.${playerId}`)
      .maybeSingle(),
    getPlayerSession()
  ]);

  if (pErr || !player) {
    notFound();
  }

  const [
    { data: standings },
    { data: matchHistory },
    { data: trophies },
    tftRank
  ] = await Promise.all([
    supabase.from("standings").select("*, tournaments(name, status, created_at)").eq("player_id", player.id).order("created_at", { ascending: false }),
    supabase.from("match_player_results").select("*, lobbies(name), tournaments(name)").eq("player_id", player.id).order("created_at", { ascending: false }).limit(20),
    supabase.from("trophies").select("*").eq("player_id", player.id).order("awarded_at", { ascending: false }),
    player.puuid ? getTftRankByPuuid(player.puuid) : Promise.resolve(null)
  ]);

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

  return (
    <Sidebar session={playerSession}>
      <PublicPlayerWrapper
        player={player}
        trophies={trophies}
        standings={standings}
        matchHistory={matchHistory}
        tftRank={tftRank}
      />
    </Sidebar>
  );
}
