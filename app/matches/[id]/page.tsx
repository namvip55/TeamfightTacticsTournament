import Link from "next/link";
import { notFound } from "next/navigation";
import { supabase } from "../../lib/supabase";
import { getPlayerSession } from "../../lib/player-auth";
import Sidebar from "../../components/Sidebar";
import {
  Zap,
  Clock,
  Layers,
  Users,
  BarChart3,
  CheckCircle2,
  Eye,
} from "lucide-react";

interface PageProps {
  params: Promise<{ id: string }>;
}

export const revalidate = 0;

function cleanName(name: string): string {
  return String(name || "")
    .replace(/^TFT\d*_/, "")
    .replace(/^TFT_/, "")
    .replace(/^Characters_/, "")
    .replace(/^Items_/, "")
    .replace(/_/g, " ");
}

function formatTime(seconds: number): string {
  const min = Math.floor((seconds || 0) / 60);
  const sec = Math.floor((seconds || 0) % 60);
  return `${min}p ${sec}s`;
}

export default async function MatchDetailPage({ params }: PageProps) {
  const resolvedParams = await params;
  const matchId = resolvedParams.id;

  const { data: matchResult, error: mErr } = await supabase
    .from("match_results")
    .select("*")
    .eq("match_id", matchId)
    .maybeSingle();

  if (mErr || !matchResult) {
    notFound();
  }

  const { data: matchPlayerResults } = await supabase
    .from("match_player_results")
    .select("*")
    .eq("match_id", matchId)
    .order("placement", { ascending: true });

  const { data: tournament } = await supabase
    .from("tournaments")
    .select("name, status, mode")
    .eq("id", matchResult.tournament_id)
    .maybeSingle();

  const { data: lobby } = await supabase
    .from("lobbies")
    .select("name")
    .eq("id", matchResult.lobby_id)
    .maybeSingle();

  const rawData = matchResult.raw_data as any;
  const gameLength = rawData?.info?.game_length;
  const tftSet = rawData?.info?.tft_set_core_name;
  const tftSetNumber = rawData?.info?.tft_set_number;
  const participants = rawData?.info?.participants || [];

  const playerSession = await getPlayerSession();

  return (
    <Sidebar session={playerSession}>
      <div className="p-4 lg:p-8 flex flex-col gap-6 max-w-7xl mx-auto">
        {/* Match Header */}
        <section className="glass-card p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-[10px] font-mono px-2.5 py-1 rounded-full font-bold uppercase border bg-green-500/10 text-green-400 border-green-500/20 flex items-center gap-1">
                <Zap className="w-3 h-3" />
                {matchId.startsWith("MANUAL_") ? "THỦ CÔNG" : "RIOT API"}
              </span>
              {tournament?.mode === "checkmate" && (
                <span className="text-[10px] font-mono px-2.5 py-1 rounded-full font-bold uppercase border bg-rose-500/10 text-rose-400 border-rose-500/20">
                  CHECKMATE
                </span>
              )}
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight font-mono">
              {matchId}
            </h1>
            <div className="flex items-center gap-3 text-xs text-zinc-500 font-mono">
              {tournament && <span>Giải: {tournament.name}</span>}
              {lobby && <span>• Lobby: {lobby.name}</span>}
              <span>
                •{" "}
                {new Date(matchResult.created_at).toLocaleString("vi-VN")}
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-1.5 text-xs font-mono bg-white/[0.02] p-4 rounded-lg border border-white/[0.06]">
            {gameLength && (
              <div>
                <span className="text-zinc-500 text-[9px] uppercase tracking-wider flex items-center gap-1">
                  <Clock className="w-3 h-3" /> Thời Gian
                </span>
                <span className="block text-zinc-200 font-bold">
                  {formatTime(gameLength)}
                </span>
              </div>
            )}
            {tftSet && (
              <div>
                <span className="text-zinc-500 text-[9px] uppercase tracking-wider flex items-center gap-1">
                  <Layers className="w-3 h-3" /> Set
                </span>
                <span className="block text-zinc-200 font-bold">
                  {tftSet} - Set {tftSetNumber}
                </span>
              </div>
            )}
            <div>
              <span className="text-zinc-500 text-[9px] uppercase tracking-wider flex items-center gap-1">
                <Users className="w-3 h-3" /> Số Người Chơi
              </span>
              <span className="block text-zinc-200 font-bold">
                {matchPlayerResults?.length || participants.length || 0}
              </span>
            </div>
          </div>
        </section>

        {/* Results Table */}
        {matchPlayerResults && matchPlayerResults.length > 0 ? (
          <section className="glass-card overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/[0.06] bg-white/[0.02]">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-[#ff5f56] block" />
                <span className="w-3 h-3 rounded-full bg-[#ffbd2e] block" />
                <span className="w-3 h-3 rounded-full bg-[#27c93f] block" />
              </div>
              <span className="text-[10px] font-mono text-zinc-500 tracking-wider">
                match-results.log
              </span>
              <div className="w-12" />
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/[0.06] bg-white/[0.02] text-[10px] font-mono uppercase text-zinc-500">
                    <th className="py-3 px-5 text-center">Hạng</th>
                    <th className="py-3 px-5">Tuyển Thủ</th>
                    <th className="py-3 px-5 text-center">Điểm</th>
                    <th className="py-3 px-5 text-center">Xác Minh</th>
                  </tr>
                </thead>
                <tbody>
                  {matchPlayerResults.map((mpr) => {
                    const participant = participants.find(
                      (p: any) => p.puuid === mpr.puuid
                    );
                    const augments = participant?.augments || [];
                    const traits = (participant?.traits || [])
                      .filter((t: any) => t.style > 0)
                      .sort(
                        (a: any, b: any) =>
                          b.style - a.style || b.num_units - a.num_units
                      )
                      .slice(0, 5);
                    const units = (participant?.units || []).sort(
                      (a: any, b: any) => b.tier - a.tier
                    );

                    return (
                      <tr
                        key={mpr.id}
                        className={`border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors ${
                          mpr.placement === 1 ? "bg-amber-500/[0.03]" : ""
                        }`}
                      >
                        <td className="py-4 px-5 text-center">
                          <span
                            className={`inline-block w-10 h-8 leading-8 text-center rounded font-bold font-mono text-sm ${
                              mpr.placement === 1
                                ? "bg-amber-500/20 text-amber-400"
                                : mpr.placement <= 4
                                ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"
                                : "bg-white/[0.04] text-zinc-500"
                            }`}
                          >
                            #{mpr.placement}
                          </span>
                        </td>
                        <td className="py-4 px-5">
                          <Link
                            href={`/player/${mpr.player_id}`}
                            className="font-bold text-zinc-200 hover:text-violet-400 transition-colors"
                          >
                            {mpr.riot_id}
                          </Link>
                          {participant && (
                            <div className="mt-2 flex flex-col gap-1.5">
                              {augments.length > 0 && (
                                <div className="flex flex-wrap gap-1">
                                  {augments.map((a: string, i: number) => (
                                    <span
                                      key={i}
                                      className="text-[9px] px-1.5 py-0.5 bg-violet-500/10 text-violet-400 border border-violet-500/20 rounded font-mono"
                                    >
                                      {cleanName(a)}
                                    </span>
                                  ))}
                                </div>
                              )}
                              {traits.length > 0 && (
                                <div className="flex flex-wrap gap-1">
                                  {traits.map((t: any, i: number) => (
                                    <span
                                      key={i}
                                      className="text-[9px] px-1.5 py-0.5 bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 rounded font-mono"
                                    >
                                      {cleanName(t.name)} ({t.num_units})
                                    </span>
                                  ))}
                                </div>
                              )}
                              {units.length > 0 && (
                                <div className="flex flex-wrap gap-1">
                                  {units
                                    .slice(0, 5)
                                    .map((u: any, i: number) => (
                                      <span
                                        key={i}
                                        className={`text-[9px] px-1.5 py-0.5 rounded font-mono border ${
                                          u.tier === 3
                                            ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                                            : u.tier === 2
                                            ? "bg-zinc-400/10 text-zinc-300 border-zinc-400/20"
                                            : "bg-white/[0.04] text-zinc-500 border-white/[0.06]"
                                        }`}
                                      >
                                        {cleanName(u.character_id)} {u.tier}⭐
                                      </span>
                                    ))}
                                </div>
                              )}
                            </div>
                          )}
                        </td>
                        <td className="py-4 px-5 text-center">
                          <span className="font-mono text-violet-400 font-bold text-lg">
                            +{mpr.points}
                          </span>
                        </td>
                        <td className="py-4 px-5 text-center">
                          <span
                            className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded flex items-center gap-1 w-fit mx-auto ${
                              mpr.verified
                                ? "bg-green-500/10 text-green-400 border border-green-500/20"
                                : "bg-zinc-500/10 text-zinc-500 border border-zinc-500/20"
                            }`}
                          >
                            {mpr.verified ? (
                              <>
                                <CheckCircle2 className="w-3 h-3" /> API
                              </>
                            ) : (
                              "Thủ công"
                            )}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        ) : (
          <div className="glass-card p-10 text-center text-zinc-500 text-sm">
            Không có dữ liệu chi tiết trận đấu.
          </div>
        )}

        {/* Raw Data Info */}
        {rawData && rawData.info && (
          <section className="glass-card p-5">
            <h3 className="text-sm font-mono font-bold text-zinc-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-violet-400" />
              Thông Tin Từ Riot API
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
              {[
                {
                  label: "Queue ID",
                  value:
                    rawData.info.tft_game_type ||
                    rawData.info.queue_id ||
                    "N/A",
                },
                {
                  label: "Game Version",
                  value: rawData.info.game_version || "N/A",
                },
                {
                  label: "Set Name",
                  value: rawData.info.tft_set_core_name || "N/A",
                },
                {
                  label: "Set Number",
                  value: rawData.info.tft_set_number || "N/A",
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className="bg-white/[0.02] border border-white/[0.06] p-3 rounded-lg"
                >
                  <span className="text-[9px] text-zinc-500 uppercase block mb-0.5">
                    {item.label}
                  </span>
                  <span className="text-zinc-200 font-bold text-[10px]">
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </Sidebar>
  );
}
