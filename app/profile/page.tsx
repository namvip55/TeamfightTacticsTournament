import { redirect } from "next/navigation";
import { supabase } from "../lib/supabase";
import { getPlayerSession } from "../lib/player-auth";
import { getTftRankByPuuid } from "../lib/actions";
import Sidebar from "../components/Sidebar";
import GamerProfileWrapper from "./GamerProfileWrapper";

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

  const [
    { data: trophies },
    { data: transactions },
    { data: purchases },
    { data: allStandings },
    tftRank
  ] = await Promise.all([
    supabase
      .from("trophies")
      .select("*")
      .eq("player_id", session.playerId)
      .order("awarded_at", { ascending: false }),
    supabase
      .from("diamond_transactions")
      .select("*, tournaments(name)")
      .eq("player_id", session.playerId)
      .order("created_at", { ascending: false })
      .limit(20),
    supabase
      .from("shop_purchases")
      .select("*, shop_items(name, item_type)")
      .eq("player_id", session.playerId)
      .order("created_at", { ascending: false })
      .limit(10),
    supabase
      .from("standings")
      .select("*, tournaments(name, status, mode)")
      .eq("player_id", session.playerId)
      .order("created_at", { ascending: false }),
    player.puuid ? getTftRankByPuuid(player.puuid) : Promise.resolve(null)
  ]);

  return (
    <Sidebar session={session}>
      <GamerProfileWrapper
        session={session}
        player={player}
        trophies={trophies}
        transactions={transactions}
        purchases={purchases}
        allStandings={allStandings}
        tftRank={tftRank}
      />
    </Sidebar>
  );
}

