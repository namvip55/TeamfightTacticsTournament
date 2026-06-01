import Link from "next/link";
import { supabase } from "./lib/supabase";
import { getPlayerSession } from "./lib/player-auth";
import Sidebar from "./components/Sidebar";
import StatCard from "./components/StatCard";
import {
  Trophy,
  Users,
  Gamepad2,
  Zap,
  ArrowRight,
  Swords,
  Crown,
  Terminal,
  ChevronRight,
  ExternalLink,
  Radio,
} from "lucide-react";

export const revalidate = 0;

export default async function Home() {
  const { data: tournaments, error: tError } = await supabase
    .from("tournaments")
    .select("*")
    .order("created_at", { ascending: false });

  const { count: totalPlayers } = await supabase
    .from("players")
    .select("*", { count: "exact", head: true });

  const { count: totalLobbies } = await supabase
    .from("lobbies")
    .select("*", { count: "exact", head: true });

  const activeTournament =
    tournaments?.find(
      (t) => t.status === "registration_open" || t.status === "active"
    ) || tournaments?.[0];

  const playerSession = await getPlayerSession();

  return (
    <Sidebar session={playerSession}>
      <div className="p-4 lg:p-8 flex flex-col gap-8 max-w-7xl mx-auto">
        {/* Hero Section */}
        <section className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-gradient-to-br from-violet-500/10 via-[#0d0d14] to-cyan-500/10 p-8 lg:p-12">
          {/* Ambient glow */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-violet-500/10 rounded-full blur-[120px] pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="flex-1 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/20 mb-4">
                <span className="w-2 h-2 rounded-full bg-green-400 neon-pulse" />
                <span className="text-[11px] font-mono text-green-400 font-bold uppercase tracking-wider">
                  Real-time Discord Sync Active
                </span>
              </div>
              <h1 className="text-4xl lg:text-5xl font-bold text-white tracking-tight leading-tight mb-4">
                Cổng thông tin giải đấu
                <br />
                <span className="gradient-text">Đấu Trường Chân Lý</span>
              </h1>
              <p className="text-sm text-zinc-400 leading-relaxed max-w-xl">
                Hệ thống tự động đồng bộ và kết nối trực tiếp với Bot Discord.
                Cập nhật bảng xếp hạng tức thì, quản lý Lobbies và tự động
                tính điểm số qua Riot Games API.
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3 w-full lg:w-auto">
              <StatCard
                label="Giải Đấu"
                value={tournaments?.length || 0}
                icon={Trophy}
                accent="violet"
              />
              <StatCard
                label="Cờ Thủ"
                value={totalPlayers || 0}
                icon={Users}
                accent="cyan"
              />
              <StatCard
                label="Lobbies"
                value={totalLobbies || 0}
                icon={Gamepad2}
                accent="amber"
              />
            </div>
          </div>
        </section>

        {/* Active Tournament & Bot Commands */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Featured Tournament */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            <h2 className="text-sm font-mono font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
              <Crown className="w-4 h-4 text-amber-400" />
              Giải đấu tiêu điểm
            </h2>

            {activeTournament ? (
              <div className="relative overflow-hidden rounded-xl border border-white/[0.08] bg-gradient-to-br from-violet-500/[0.07] to-cyan-500/[0.03] p-6">
                <div className="absolute top-0 right-0 w-64 h-64 bg-violet-500/5 rounded-full blur-[80px] pointer-events-none" />

                <div className="relative z-10 flex flex-col gap-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex flex-col gap-2">
                      <span
                        className={`inline-flex items-center gap-1.5 w-fit text-[10px] font-mono font-bold px-2.5 py-1 rounded-full uppercase tracking-wider border ${
                          activeTournament.status === "registration_open"
                            ? "bg-green-500/10 text-green-400 border-green-500/20"
                            : activeTournament.status === "active"
                            ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                            : "bg-zinc-500/10 text-zinc-400 border-zinc-500/20"
                        }`}
                      >
                        <Radio className="w-3 h-3" />
                        {activeTournament.status === "registration_open"
                          ? "ĐANG MỞ ĐĂNG KÝ"
                          : activeTournament.status === "active"
                          ? "ĐANG DIỄN RA"
                          : "ĐÃ KẾT THÚC"}
                      </span>
                      <h3 className="text-2xl font-bold text-white">
                        {activeTournament.name}
                      </h3>
                    </div>

                    <Link
                      href={`/tournaments/${activeTournament.id}`}
                      className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-gradient-to-r from-violet-600 to-violet-500 hover:from-violet-500 hover:to-violet-400 text-white font-semibold rounded-lg transition-all text-sm neon-glow"
                    >
                      Xem Bảng Xếp Hạng
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>

                  <div className="h-px bg-white/[0.06]" />

                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 text-xs font-mono">
                    <div>
                      <span className="block text-[9px] text-zinc-500 uppercase tracking-wider mb-1">
                        Đăng Ký
                      </span>
                      <span
                        className={
                          activeTournament.registration_open
                            ? "text-green-400"
                            : "text-rose-400"
                        }
                      >
                        {activeTournament.registration_open
                          ? "Mở Đăng Ký"
                          : "Đã Đóng"}
                      </span>
                    </div>
                    <div>
                      <span className="block text-[9px] text-zinc-500 uppercase tracking-wider mb-1">
                        Ngày Tạo
                      </span>
                      <span className="text-zinc-300">
                        {new Date(activeTournament.created_at).toLocaleDateString(
                          "vi-VN"
                        )}
                      </span>
                    </div>
                    <div>
                      <span className="block text-[9px] text-zinc-500 uppercase tracking-wider mb-1">
                        Chế Độ
                      </span>
                      <span
                        className={
                          activeTournament.mode === "checkmate"
                            ? "text-rose-400 font-bold"
                            : "text-zinc-300"
                        }
                      >
                        {activeTournament.mode === "checkmate"
                          ? "⚔️ Checkmate"
                          : "📊 Giải thường"}
                      </span>
                    </div>
                    <div>
                      <span className="block text-[9px] text-zinc-500 uppercase tracking-wider mb-1">
                        Trạng Thái
                      </span>
                      <span
                        className={
                          activeTournament.status === "finished"
                            ? "text-zinc-500"
                            : "text-cyan-400"
                        }
                      >
                        {activeTournament.status === "finished"
                          ? "Đã kết thúc"
                          : "Đang diễn ra"}
                      </span>
                    </div>
                    <div>
                      <span className="block text-[9px] text-zinc-500 uppercase tracking-wider mb-1">
                        Đồng Bộ
                      </span>
                      <span className="text-green-400">Discord Bot</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="glass-card p-10 text-center flex flex-col items-center justify-center gap-4">
                <Gamepad2 className="w-12 h-12 text-zinc-600" />
                <p className="text-zinc-500 text-sm">
                  Chưa có giải đấu nào được tạo.
                </p>
                <Link
                  href="/admin"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-violet-600 hover:bg-violet-500 text-white font-semibold rounded-lg transition-colors text-sm"
                >
                  Tạo Giải Đấu Đầu Tiên
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            )}
          </div>

          {/* Bot Commands Panel */}
          <div className="flex flex-col gap-4">
            <h2 className="text-sm font-mono font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
              <Terminal className="w-4 h-4 text-cyan-400" />
              Hướng dẫn Bot Discord
            </h2>
            <div className="glass-card p-5 flex flex-col gap-3">
              <p className="text-xs text-zinc-400 leading-relaxed">
                Người chơi và Admin có thể dùng Bot Discord trực tiếp:
              </p>

              <div className="flex flex-col gap-2">
                {[
                  {
                    cmd: "/dangky riot_id:[Tên#Tag]",
                    desc: "Đăng ký tham gia giải đấu TFT.",
                    admin: false,
                  },
                  {
                    cmd: "/bxh",
                    desc: "Xem bảng xếp hạng giải đấu hiện tại.",
                    admin: false,
                  },
                  {
                    cmd: "/player_profile riot_id:[Tên#Tag]",
                    desc: "Xem hồ sơ TFT: rank, win rate, tướng hay dùng.",
                    admin: false,
                  },
                  {
                    cmd: "/taogiai ten:[Tên] so_lobby:[Số]",
                    desc: "Admin tạo giải đấu với nhiều lobby.",
                    admin: true,
                  },
                  {
                    cmd: "/diem_lobby so_lobby:[Số]",
                    desc: "Admin tính điểm tự động qua Riot API.",
                    admin: true,
                  },
                  {
                    cmd: "/checkvar_lobby so_lobby:[Số]",
                    desc: "Scout tuyển thủ: Top 4, win rate.",
                    admin: true,
                  },
                ].map((item, i) => (
                  <div
                    key={i}
                    className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.06] hover:border-violet-500/20 transition-colors"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <code className="text-[11px] font-mono text-violet-400 font-bold">
                        {item.cmd}
                      </code>
                      {item.admin && (
                        <span className="text-[8px] font-mono px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                          ADMIN
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-zinc-500">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Tournament List */}
        <section id="tournaments-list" className="flex flex-col gap-4">
          <h2 className="text-sm font-mono font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
            <Swords className="w-4 h-4 text-violet-400" />
            Danh sách các giải đấu
          </h2>

          {tournaments && tournaments.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {tournaments.map((t) => {
                const isFeatured = t.id === activeTournament?.id;
                return (
                  <Link
                    key={t.id}
                    href={`/tournaments/${t.id}`}
                    className={`glass-card p-5 flex flex-col justify-between gap-4 group ${
                      isFeatured
                        ? "border-violet-500/30 shadow-[0_0_20px_rgba(139,92,246,0.1)]"
                        : ""
                    }`}
                  >
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono text-zinc-500">
                          {new Date(t.created_at).toLocaleDateString("vi-VN")}
                        </span>
                        <div className="flex items-center gap-1.5">
                          {t.mode === "checkmate" && (
                            <span className="text-[9px] font-mono px-2 py-0.5 rounded-full font-bold uppercase border bg-rose-500/10 text-rose-400 border-rose-500/20">
                              Checkmate
                            </span>
                          )}
                          <span
                            className={`text-[9px] font-mono px-2 py-0.5 rounded-full font-bold uppercase border ${
                              t.status === "registration_open"
                                ? "bg-green-500/10 text-green-400 border-green-500/20"
                                : t.status === "active"
                                ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                                : "bg-zinc-500/10 text-zinc-400 border-zinc-500/20"
                            }`}
                          >
                            {t.status === "registration_open"
                              ? "Đăng ký mở"
                              : t.status === "active"
                              ? "Đang đấu"
                              : "Hoàn thành"}
                          </span>
                        </div>
                      </div>
                      <h4 className="font-bold text-white text-base line-clamp-1 group-hover:text-violet-400 transition-colors">
                        {t.name}
                      </h4>
                      {t.winner_riot_id && (
                        <p className="text-[10px] text-amber-400 font-mono font-bold flex items-center gap-1">
                          <Crown className="w-3 h-3" />
                          {t.winner_riot_id}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center justify-between gap-4 pt-3 border-t border-white/[0.06]">
                      <span className="text-[11px] text-zinc-500 font-mono flex items-center gap-1">
                        {t.mode === "checkmate" ? "⚔️ Checkmate • " : ""}
                        Xem chi tiết
                      </span>
                      <ChevronRight className="w-4 h-4 text-zinc-500 group-hover:text-violet-400 transition-colors" />
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="glass-card p-10 text-center text-zinc-500">
              Chưa có danh sách giải đấu.
            </div>
          )}
        </section>
      </div>
    </Sidebar>
  );
}
