"use client";

import { useState } from "react";
import {
  User,
  Trophy,
  Gem,
  History,
  BarChart3,
  Flame,
  Crown,
  Sparkles,
  Sword,
  Shield,
  Users
} from "lucide-react";
import TrophyCase from "../../components/TrophyCase";
import Link from "next/link";

interface PublicPlayerWrapperProps {
  player: any;
  trophies: any[] | null;
  standings: any[] | null;
  matchHistory: any[] | null;
  tftRank: any;
}

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

export default function PublicPlayerWrapper({
  player,
  trophies,
  standings,
  matchHistory,
  tftRank,
}: PublicPlayerWrapperProps) {
  const [activeSubHeader, setActiveSubHeader] = useState<"profile" | "achievements">("profile");
  const [activeTab, setActiveTab] = useState<string>("home");

  // Calculate statistics
  let totalGames = 0;
  let totalWins = 0;
  let totalTop4 = 0;
  let totalPoints = 0;
  let bestPlacement = Infinity;
  let bestTournament = "";

  if (standings) {
    standings.forEach((s) => {
      totalGames += s.games_played;
      totalWins += s.total_wins;
      totalTop4 += s.total_top4;
      totalPoints += s.total_points;
      if (s.total_points > 0 && (bestPlacement === Infinity || s.avg_placement < bestPlacement)) {
        bestPlacement = s.avg_placement;
        bestTournament = s.tournaments?.name || "";
      }
    });
  }

  const winRate = totalGames > 0 ? ((totalWins / totalGames) * 100).toFixed(1) : "0.0";
  const top4Rate = totalGames > 0 ? ((totalTop4 / totalGames) * 100).toFixed(1) : "0.0";
  const avgPlacement = totalGames > 0 ? (standings?.reduce((sum, s) => sum + (s.avg_placement * s.games_played), 0) / totalGames).toFixed(2) : "N/A";

  // Calculate career days
  const createdDate = new Date(player.created_at);
  const diffTime = Math.abs(new Date().getTime() - createdDate.getTime());
  const daysPlayed = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

  const gameTags = [
    "Tactician",
    totalGames > 20 ? "Veteran" : "Challenger",
    parseFloat(winRate) > 15 ? "Burst Carry" : "Flex Play",
    parseFloat(top4Rate) > 50 ? "Infinite Crit" : "Balanced",
    "TFT Arena"
  ];

  const isVideoUrl = (url: string) => {
    if (!url) return false;
    const cleanUrl = url.toLowerCase().split("?")[0];
    return (
      cleanUrl.endsWith(".mp4") ||
      cleanUrl.endsWith(".webm") ||
      cleanUrl.endsWith(".ogg") ||
      cleanUrl.endsWith(".mov") ||
      url.includes("player.vimeo.com") ||
      url.includes("youtube.com/embed")
    );
  };

  const hasCustomBg = !!player.profile_bg_url;
  const bgIsVideo = hasCustomBg && isVideoUrl(player.profile_bg_url);

  const sidebarItems = [
    { id: "home", label: "Home", sub: "Trang chủ" },
    { id: "battle", label: "Battle Point", sub: "Giải đấu tham gia" },
    { id: "hero", label: "Hero Info", sub: "Chỉ số chi tiết" },
    { id: "mount", label: "Mount", sub: "Bộ sưu tập Cúp" },
    { id: "matches", label: "Match Log", sub: "Lịch sử trận đấu" },
  ];

  const renderBackgroundHero = () => {
    if (bgIsVideo) {
      return (
        <video
          key={player.profile_bg_url}
          src={player.profile_bg_url}
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover rounded-2xl opacity-90 mix-blend-screen"
        />
      );
    }

    const imageSrc = player.profile_bg_url || "/mushroom-character.png";

    return (
      <img
        src={imageSrc}
        alt="Player Hero Visual"
        className="absolute bottom-0 right-0 w-auto h-[90%] md:h-[95%] lg:h-[100%] max-w-full object-contain z-10 transition-transform duration-700 hover:scale-105"
      />
    );
  };

  return (
    <div className="w-full flex flex-col gap-6 max-w-6xl mx-auto p-2 md:p-4 font-sans text-zinc-100">
      
      {/* SUB-HEADER TABS */}
      <div className="flex items-center gap-1 border-b border-white/[0.08] pb-1 px-2">
        <button
          onClick={() => setActiveSubHeader("profile")}
          className={`px-6 py-2.5 text-sm font-semibold tracking-wider relative transition-all duration-300 ${
            activeSubHeader === "profile" 
              ? "text-violet-400 font-bold" 
              : "text-zinc-400 hover:text-zinc-200"
          }`}
        >
          Profile
          {activeSubHeader === "profile" && (
            <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-gradient-to-r from-violet-500 to-cyan-400 shadow-[0_0_12px_rgba(139,92,246,0.6)]" />
          )}
        </button>
        <button
          onClick={() => setActiveSubHeader("achievements")}
          className={`px-6 py-2.5 text-sm font-semibold tracking-wider relative transition-all duration-300 ${
            activeSubHeader === "achievements" 
              ? "text-violet-400 font-bold" 
              : "text-zinc-400 hover:text-zinc-200"
          }`}
        >
          Achievements
          {activeSubHeader === "achievements" && (
            <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-gradient-to-r from-violet-500 to-cyan-400 shadow-[0_0_12px_rgba(139,92,246,0.6)]" />
          )}
        </button>
      </div>

      {/* RENDER FOR ACHIEVEMENTS TABS */}
      {activeSubHeader === "achievements" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-3 glass-card p-6">
            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-400 animate-bounce" />
              BỘ SƯU TẬP VINH DANH & CÚP GIẢI ĐẤU
            </h3>
            <TrophyCase trophies={trophies || []} />
          </div>
        </div>
      )}

      {/* RENDER FOR MAIN PROFILE TABS */}
      {activeSubHeader === "profile" && (
        <div className="flex flex-col lg:flex-row gap-6 w-full items-stretch min-h-[580px]">
          
          {/* LEFT VERTICAL NAVBAR */}
          <div className="w-full lg:w-48 flex flex-row lg:flex-col gap-1 overflow-x-auto lg:overflow-x-visible pb-2 lg:pb-0 shrink-0">
            {sidebarItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center justify-between px-4 py-3 rounded-lg text-left transition-all duration-300 whitespace-nowrap lg:whitespace-normal cursor-pointer select-none group border ${
                    isActive 
                      ? "bg-gradient-to-r from-violet-600/30 to-cyan-500/20 border-violet-500 text-violet-300 shadow-[0_0_15px_rgba(139,92,246,0.15)] font-bold scale-[1.02]"
                      : "bg-white/[0.01] border-transparent hover:bg-white/[0.04] text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold tracking-wide uppercase">{item.label}</span>
                    <span className="text-[10px] text-zinc-500 font-normal hidden lg:block group-hover:text-zinc-400 transition-colors">
                      {item.sub}
                    </span>
                  </div>
                  <Crown className={`w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity ml-2 ${isActive ? "opacity-100 text-violet-400" : "text-zinc-500"}`} />
                </button>
              );
            })}
          </div>

          {/* MAIN CONTAINER PANELS */}
          <div className="flex-1 min-w-0">
            
            {/* VIEW 1: HOME PANEL */}
            {activeTab === "home" && (
              <div 
                className="relative w-full min-h-[520px] rounded-2xl border border-white/[0.08] overflow-hidden bg-cover bg-center flex flex-col md:flex-row items-stretch"
                style={{
                  background: "radial-gradient(circle at 30% 30%, #1e1b29 0%, #0d0c15 100%)"
                }}
              >
                {/* Neon Ambient lights overlays */}
                <div className="absolute inset-0 bg-gradient-to-tr from-violet-600/10 via-transparent to-cyan-500/10 pointer-events-none" />
                <div className="absolute bottom-0 right-0 w-[50%] h-[50%] bg-violet-600/20 blur-[120px] rounded-full pointer-events-none" />
                
                {/* Hero Background */}
                <div className="absolute right-0 bottom-0 top-0 w-full md:w-[60%] pointer-events-none select-none z-0 overflow-hidden flex items-end justify-end">
                  {renderBackgroundHero()}
                </div>

                {/* Left Area Content: Player Profile HUD */}
                <div className="w-full md:w-[60%] lg:w-[50%] p-6 md:p-8 flex flex-col justify-between relative z-20 bg-gradient-to-r from-[#0d0c15] via-[#0d0c15]/95 to-transparent">
                  
                  <div className="flex flex-col gap-5">
                    
                    {/* User credentials */}
                    <div className="flex items-center gap-4">
                      {/* Avatar with glowing ring */}
                      <div className="relative group">
                        <div className="absolute -inset-1.5 bg-gradient-to-tr from-violet-500 via-cyan-400 to-amber-500 rounded-full blur-[4px] opacity-75 animate-spin-slow" />
                        <div className="relative w-16 h-16 rounded-full border-2 border-[#12111a] bg-zinc-900 overflow-hidden flex items-center justify-center">
                          {player.avatar_url || player.discord_avatar_url ? (
                            <img src={player.avatar_url || player.discord_avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                          ) : (
                            <User className="w-8 h-8 text-zinc-600" />
                          )}
                        </div>
                        <div className="absolute -bottom-1 -right-1 bg-amber-500 text-[#0d0c15] p-1 rounded-full border border-[#0d0c15] shadow-lg flex items-center justify-center">
                          <Crown className="w-3.5 h-3.5" />
                        </div>
                      </div>

                      {/* Display name */}
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h2 className="text-xl font-bold tracking-wide text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                            {player.display_name || player.riot_id}
                          </h2>
                          {tftRank && tftRank.tier !== "UNRANKED" && (
                            <span className="px-1.5 py-0.5 rounded bg-violet-600/30 text-violet-400 border border-violet-500/30 text-[9px] font-mono font-bold flex items-center gap-1 uppercase">
                              {tftRank.tier} {tftRank.rank}
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-zinc-500 font-mono tracking-wider mt-0.5">
                          @{player.discord_username || player.discord_id}
                        </div>
                      </div>
                    </div>

                    {/* Gaming Badges Tags */}
                    <div className="flex flex-wrap gap-1.5 max-w-md">
                      {gameTags.map((tag, idx) => (
                        <span 
                          key={tag} 
                          className={`px-2 py-0.5 text-[9px] font-mono tracking-wider font-semibold rounded uppercase border ${
                            idx === 0 
                              ? "bg-amber-500/10 border-amber-500/30 text-amber-400"
                              : idx === 1
                              ? "bg-cyan-500/10 border-cyan-500/30 text-cyan-400"
                              : idx === 2
                              ? "bg-violet-500/10 border-violet-500/30 text-violet-400"
                              : "bg-white/[0.02] border-white/[0.08] text-zinc-400"
                          }`}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    {/* Bio quote */}
                    <div className="flex items-center gap-2 bg-white/[0.02] border border-white/[0.06] rounded-lg p-2.5 max-w-sm">
                      <div className="text-xs text-zinc-300 italic font-mono truncate">
                        "{player.bio || "Người chơi đấu trường chân lý..."}"
                      </div>
                    </div>

                    {/* Ornate Medals Shields */}
                    <div className="flex items-center gap-4 mt-1 border-t border-b border-white/[0.06] py-3">
                      {[
                        { title: "Season", val: "S12", icon: Sparkles, color: "text-amber-400" },
                        { title: "History", val: "Top 4", icon: Shield, color: "text-cyan-400" },
                        { title: "Marks", val: trophies?.length || 0, icon: Crown, color: "text-violet-400" },
                        { title: "Peak", val: avgPlacement !== "N/A" ? `Placement ${avgPlacement}` : "N/A", icon: Flame, color: "text-rose-400" }
                      ].map((item, idx) => (
                        <div key={idx} className="flex flex-col items-center text-center shrink-0">
                          <div className={`w-10 h-10 rounded-full bg-white/[0.02] border border-white/[0.08] flex items-center justify-center shadow-lg relative`}>
                            <item.icon className={`w-4 h-4 ${item.color}`} />
                          </div>
                          <span className="text-[8px] text-zinc-500 font-mono tracking-wider mt-1 uppercase">{item.title}</span>
                          <span className="text-[10px] font-bold text-zinc-200 mt-0.5">{item.val}</span>
                        </div>
                      ))}
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-3 mt-1 max-w-md">
                      <div className="flex flex-col">
                        <span className="text-lg font-extrabold tracking-tight text-white font-mono">{totalGames}</span>
                        <span className="text-[9px] text-zinc-500 font-mono tracking-wider uppercase">Battles Played</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-lg font-extrabold tracking-tight text-violet-400 font-mono">{winRate}%</span>
                        <span className="text-[9px] text-zinc-500 font-mono tracking-wider uppercase">Win Rate</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-lg font-extrabold tracking-tight text-cyan-400 font-mono">{daysPlayed}d</span>
                        <span className="text-[9px] text-zinc-500 font-mono tracking-wider uppercase">Career Days</span>
                      </div>
                    </div>

                  </div>

                  {/* Online display / Guild */}
                  <div className="mt-8 border-t border-white/[0.06] pt-4">
                    <div className="text-[9px] text-zinc-500 font-mono uppercase tracking-wider mb-2 flex items-center gap-1">
                      <Users className="w-3 h-3" /> Guild & Friends
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="flex -space-x-2.5 overflow-hidden">
                        {[
                          "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80",
                          "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=100&q=80",
                          "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80",
                        ].map((imgUrl, i) => (
                          <img 
                            key={i} 
                            src={imgUrl} 
                            alt="Friend avatar" 
                            className="inline-block h-6 w-6 rounded-full ring-2 ring-[#0d0c15] object-cover" 
                          />
                        ))}
                      </div>
                      <span className="text-[9px] text-zinc-500 font-mono ml-2">Online</span>
                    </div>
                  </div>

                </div>

              </div>
            )}

            {/* VIEW 2: BATTLE POINT */}
            {activeTab === "battle" && (
              <div className="flex flex-col gap-6">
                <div className="glass-card p-6">
                  <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                    <History className="w-5 h-5 text-violet-400" />
                    GIẢI ĐẤU ĐÃ THAM GIA & ĐIỂM SỐ
                  </h3>
                  
                  {standings && standings.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {standings.map((s) => {
                        const top4R = s.games_played > 0 ? ((s.total_top4 / s.games_played) * 100).toFixed(0) : "0";
                        const isWinner = trophies?.some(t => t.tournament_id === s.tournament_id && t.trophy_type === "champion");
                        
                        return (
                          <Link
                            key={s.id}
                            href={`/tournaments/${s.tournament_id}`}
                            className={`p-4 rounded-xl bg-white/[0.02] border transition-all duration-300 hover:scale-[1.01] flex items-center justify-between group ${
                              isWinner ? "border-amber-500/30 hover:border-amber-500 bg-amber-500/[0.01]" : "border-white/[0.08] hover:border-violet-500/40"
                            }`}
                          >
                            <div className="flex flex-col gap-1">
                              <span className="text-sm font-bold text-zinc-200 group-hover:text-violet-400 transition-colors flex items-center gap-1.5">
                                {s.tournaments?.name || "N/A"}
                                {isWinner && <Crown className="w-3.5 h-3.5 text-amber-400 shrink-0" />}
                              </span>
                              <span className="text-xs text-zinc-500 font-mono">
                                Đã chơi: {s.games_played} trận • Tỉ lệ Top4: {top4R}%
                              </span>
                              <span className="text-xs text-zinc-500 font-mono">
                                Vị trí TB: {s.avg_placement}
                              </span>
                            </div>
                            <div className="text-right flex flex-col items-end">
                              <span className={`text-base font-extrabold font-mono ${isWinner ? "text-amber-400" : "text-violet-400"}`}>
                                {s.total_points}đ
                              </span>
                              <span className="text-[9px] text-zinc-500 font-mono uppercase tracking-wider">Tích lũy</span>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-zinc-500 text-sm font-mono">
                      Người chơi chưa tham gia giải đấu nào.
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* VIEW 3: HERO DETAIL STATS */}
            {activeTab === "hero" && (
              <div className="glass-card p-6">
                <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-cyan-400" />
                  THỐNG KÊ CHI TIẾT TỔNG THỂ
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {[
                    { label: "Tổng số trận đấu", value: totalGames, color: "text-white", labelColor: "text-zinc-500" },
                    { label: "Tỷ lệ thắng trận", value: `${winRate}%`, color: "text-violet-400", labelColor: "text-violet-500/70" },
                    { label: "Tỷ lệ lọt Top 4", value: `${top4Rate}%`, color: "text-cyan-400", labelColor: "text-cyan-500/70" },
                    { label: "Vị trí trung bình", value: avgPlacement, color: "text-amber-400", labelColor: "text-amber-500/70" },
                    { label: "Tổng điểm tích lũy", value: totalPoints, color: "text-green-400", labelColor: "text-green-500/70" },
                    { label: "Số giải đã đấu", value: standings?.length || 0, color: "text-zinc-200", labelColor: "text-zinc-500" },
                    { label: "Tổng số Cup", value: trophies?.length || 0, color: "text-amber-400", labelColor: "text-amber-500/70" },
                    { label: "Diamonds sở hữu", value: player.diamonds || 0, color: "text-cyan-400", labelColor: "text-cyan-500/70" },
                  ].map((stat) => (
                    <div
                      key={stat.label}
                      className="bg-white/[0.02] border border-white/[0.06] p-4 rounded-xl text-center flex flex-col justify-center gap-1"
                    >
                      <span className={`text-2xl font-black font-mono tracking-tight ${stat.color}`}>
                        {stat.value}
                      </span>
                      <p className={`text-[10px] font-semibold font-mono uppercase mt-1 tracking-wider ${stat.labelColor}`}>
                        {stat.label}
                      </p>
                    </div>
                  ))}
                </div>
                {bestTournament && (
                  <div className="mt-6 p-4 rounded-xl bg-violet-500/10 border border-violet-500/20 max-w-md">
                    <p className="text-xs text-zinc-300 font-mono flex items-center gap-2">
                      <Crown className="w-4 h-4 text-amber-400" />
                      Giải đấu tốt nhất: <span className="text-white font-bold">{bestTournament}</span>
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* VIEW 4: MOUNT */}
            {activeTab === "mount" && (
              <div className="glass-card p-6">
                <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-amber-400" />
                  KỶ VẬT TROPHY CASE
                </h3>
                <TrophyCase trophies={trophies || []} />
              </div>
            )}

            {/* VIEW 5: MATCH HISTORY LOG TABLE */}
            {activeTab === "matches" && (
              <div className="flex flex-col gap-4">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <History className="w-5 h-5 text-violet-400" />
                  LỊCH SỬ THI ĐẤU CHI TIẾT
                </h3>
                <div className="glass-card overflow-hidden">
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
                                className="py-3 px-4 text-xs text-zinc-200 font-semibold truncate max-w-[150px]"
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
                                {new Date(match.created_at).toLocaleDateString("vi-VN")}
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
              </div>
            )}

          </div>

        </div>
      )}

    </div>
  );
}
