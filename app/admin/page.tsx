import { redirect } from "next/navigation";
import { supabase } from "../lib/supabase";
import { verifyAdminSession } from "../lib/auth";
import { getPlayerSession } from "../lib/player-auth";
import Sidebar from "../components/Sidebar";
import AdminClient from "./AdminClient";
import { Shield } from "lucide-react";

export const revalidate = 0;

export default async function AdminPage() {
  const isAuthorized = await verifyAdminSession();
  if (!isAuthorized) {
    redirect("/admin/login");
  }

  const { data: tournaments } = await supabase
    .from("tournaments")
    .select("*")
    .order("created_at", { ascending: false });

  const { data: lobbies } = await supabase.from("lobbies").select("*");

  const { data: lobbyPlayers } = await supabase
    .from("lobby_players")
    .select("*");

  const { data: matchResults } = await supabase
    .from("match_results")
    .select("*")
    .order("created_at", { ascending: false });

  const { data: standings } = await supabase
    .from("standings")
    .select("*")
    .order("total_points", { ascending: false });

  const { data: shopItems } = await supabase
    .from("shop_items")
    .select("*")
    .order("created_at", { ascending: false });

  const playerSession = await getPlayerSession();

  return (
    <Sidebar session={playerSession}>
      <div className="p-4 lg:p-8 flex flex-col gap-6 max-w-7xl mx-auto">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-3">
            <Shield className="w-6 h-6 text-amber-400" />
            Hệ Thống Quản Trị Giải Đấu
          </h1>
          <p className="text-sm text-zinc-500">
            Tạo giải đấu mới, thay đổi trạng thái đăng ký, nhập kết quả thi
            đấu thủ công hoặc tự động đồng bộ qua Riot Games API.
          </p>
        </div>

        <AdminClient
          tournaments={tournaments || []}
          lobbies={lobbies || []}
          lobbyPlayers={lobbyPlayers || []}
          matchResults={matchResults || []}
          standings={standings || []}
          shopItems={shopItems || []}
        />
      </div>
    </Sidebar>
  );
}
