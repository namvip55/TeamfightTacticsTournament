import { supabase } from "../lib/supabase";
import { getPlayerSession } from "../lib/player-auth";
import Sidebar from "../components/Sidebar";
import CompsClient from "./CompsClient";

export const revalidate = 0;

export default async function CompsPage() {
  const [
    { data: comps },
    playerSession
  ] = await Promise.all([
    supabase.from("tft_comps").select("*").eq("is_active", true).order("created_at", { ascending: false }),
    getPlayerSession()
  ]);

  return (
    <Sidebar session={playerSession}>
      <CompsClient initialComps={comps || []} />
    </Sidebar>
  );
}
