"use client";

import { useState } from "react";
import {
  User,
  Trophy,
  Gem,
  ShoppingBag,
  History,
  BarChart3,
  Settings,
  Flame,
  Crown,
  Sparkles,
  Sword,
  Shield,
  MessageSquare,
  ThumbsUp,
  Heart
} from "lucide-react";
import ProfileEditForm from "./ProfileEditForm";
import DiamondHistory from "./DiamondHistory";
import TrophyCase from "../components/TrophyCase";
import Link from "next/link";

interface GamerProfileWrapperProps {
  session: any;
  player: any;
  trophies: any[] | null;
  transactions: any[] | null;
  purchases: any[] | null;
  allStandings: any[] | null;
  tftRank?: any;
}

export default function GamerProfileWrapper({
  session,
  player,
  trophies,
  transactions,
  purchases,
  allStandings,
  tftRank,
}: GamerProfileWrapperProps) {
  // Tabs state
  const [activeSubHeader, setActiveSubHeader] = useState<"profile" | "achievements">("profile");
  const [activeTab, setActiveTab] = useState<string>("home");

  // Calculate statistics
  let totalGames = 0;
  let totalWins = 0;
  let totalTop4 = 0;
  let totalPoints = 0;
  let bestPlacement = Infinity;
  let bestTournament = "";

  if (allStandings) {
    allStandings.forEach((s) => {
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
  const avgPlacement = totalGames > 0 ? (allStandings?.reduce((sum, s) => sum + (s.avg_placement * s.games_played), 0) / totalGames).toFixed(2) : "N/A";

  // Calculate days played (career)
  const createdDate = new Date(player.created_at);
  const diffTime = Math.abs(new Date().getTime() - createdDate.getTime());
  const daysPlayed = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

  // Custom gaming tags configured by the user
  const tagsStr = player.social_links?.tags || "";
  const gameTags = tagsStr ? tagsStr.split(",").map((t: string) => t.trim()).filter(Boolean) : [];

  // Detect if custom background is a video URL
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

  // Left vertical navigation items
  const sidebarItems = [
    { id: "home", label: "Home", sub: "Trang chủ" },
    { id: "battle", label: "Battle Point", sub: "Thông số giải" },
    { id: "hero", label: "Hero Info", sub: "Chỉ số chi tiết" },
    { id: "weapon", label: "Weapon", sub: "Kho vật phẩm" },
    { id: "mount", label: "Mount", sub: "Bộ sưu tập Cúp" },
    { id: "social", label: "Social Settings", sub: "Thiết lập profile" },
  ];

  // Helper to render background image/video
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
        alt="Profile Hero Visual"
        className="absolute bottom-0 right-0 w-auto h-[90%] md:h-[95%] lg:h-[100%] max-w-full object-contain z-10 transition-transform duration-700 hover:scale-105"
      />
    );
  };

  return (
    <div className="w-full flex flex-col gap-6 max-w-6xl mx-auto p-2 md:p-4 font-sans text-zinc-100">
      
      {/* SUB-HEADER TABS (Profile | Achievements) */}
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
          
          {/* LEFT VERTICAL NAVBAR (Home, Battle Point, Hero, Weapon, Mount, Social) */}
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
            
            {/* VIEW 1: HOME PANEL (Screenshot-like game-card HUD) */}
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
                
                {/* Hero Illustration Background (Video / Image) on Right side */}
                <div className="absolute right-0 bottom-0 top-0 w-full md:w-[60%] pointer-events-none select-none z-0 overflow-hidden flex items-end justify-end">
                  {renderBackgroundHero()}
                </div>

                {/* Left Area Content: Player Profile HUD */}
                <div className="w-full md:w-[60%] lg:w-[50%] p-6 md:p-8 flex flex-col justify-between relative z-20 bg-gradient-to-r from-[#0d0c15] via-[#0d0c15]/95 to-transparent">
                  
                  {/* Player header credentials */}
                  <div className="flex flex-col gap-5">
                    
                    {/* User credentials summary */}
                    <div className="flex items-center gap-4">
                      {/* Ornate Avatar with glowing ring */}
                      <div className="relative group cursor-pointer">
                        <div className="absolute -inset-1.5 bg-gradient-to-tr from-violet-500 via-cyan-400 to-amber-500 rounded-full blur-[4px] opacity-75 animate-spin-slow group-hover:opacity-100 transition-opacity" />
                        <div className="relative w-16 h-16 rounded-full border-2 border-[#12111a] bg-zinc-900 overflow-hidden flex items-center justify-center">
                          {player.avatar_url ? (
                            <img src={player.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                          ) : player.discord_avatar_url ? (
                            <img src={player.discord_avatar_url} alt="Discord Avatar" className="w-full h-full object-cover" />
                          ) : (
                            <User className="w-8 h-8 text-zinc-600" />
                          )}
                        </div>
                        {/* SVIP rank circle */}
                        <div className="absolute -bottom-1 -right-1 bg-amber-500 text-[#0d0c15] p-1 rounded-full border border-[#0d0c15] shadow-lg flex items-center justify-center">
                          <Crown className="w-3.5 h-3.5" />
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h2 className="text-xl font-bold tracking-wide text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                            {player.display_name || player.riot_id}
                          </h2>
                          {tftRank && tftRank.tier !== "UNRANKED" && (
                            <div className="px-1.5 py-0.5 rounded bg-violet-600/30 text-violet-400 border border-violet-500/30 text-[9px] font-mono font-bold flex items-center gap-1 uppercase">
                              {tftRank.tier} {tftRank.rank}
                            </div>
                          )}
                        </div>
                        <div className="text-[10px] text-zinc-500 font-mono tracking-wider mt-0.5">
                          @{player.discord_username || player.discord_id}
                        </div>
                      </div>
                    </div>

                    {/* Gaming Badges Tags - only shown if user has configured them */}
                    {gameTags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 max-w-md">
                        {gameTags.map((tag: string, idx: number) => (
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
                    )}

                    {/* Bio quote with direct settings toggle - only shown if user has written a bio */}
                    {player.bio ? (
                      <div className="flex items-center gap-2 bg-white/[0.02] border border-white/[0.06] rounded-lg p-2.5 pr-8 relative max-w-sm">
                        <div className="text-xs text-zinc-300 italic font-mono truncate">
                          "{player.bio}"
                        </div>
                        <button 
                          onClick={() => setActiveTab("social")}
                          className="absolute right-2 text-zinc-500 hover:text-white cursor-pointer transition-colors"
                          title="Chỉnh sửa tiểu sử"
                        >
                          <Settings className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setActiveTab("social")}
                        className="flex items-center gap-2 text-xs text-zinc-500 font-mono hover:text-violet-400 transition-colors cursor-pointer"
                      >
                        <Settings className="w-3.5 h-3.5" /> Thiết lập tiểu sử...
                      </button>
                    )}

                    {/* Medals shields row - only real player data */}
                    <div className="flex items-center gap-4 mt-1 border-t border-b border-white/[0.06] py-3">
                      {[
                        { title: "Giải Đấu", val: allStandings?.length || 0, icon: Sparkles, color: "text-amber-400" },
                        { title: "Top 4 Rate", val: `${top4Rate}%`, icon: Shield, color: "text-cyan-400" },
                        { title: "Cúp", val: trophies?.length || 0, icon: Crown, color: "text-violet-400" },
                        { title: "Vị Trí TB", val: avgPlacement, icon: Flame, color: "text-rose-400" }
                      ].map((item, idx) => (
                        <div key={idx} className="flex flex-col items-center text-center shrink-0">
                          <div className={`w-10 h-10 rounded-full bg-white/[0.02] border border-white/[0.08] flex items-center justify-center shadow-lg relative group overflow-hidden`}>
                            <div className="absolute inset-0 bg-gradient-to-tr from-white/[0.05] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            <item.icon className={`w-4 h-4 ${item.color}`} />
                          </div>
                          <span className="text-[8px] text-zinc-500 font-mono tracking-wider mt-1 uppercase">{item.title}</span>
                          <span className="text-[10px] font-bold text-zinc-200 mt-0.5">{item.val}</span>
                        </div>
                      ))}
                    </div>

                    {/* Core Dashboard Gamer Stats details */}
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

                  {/* Diamond & Points summary at the bottom */}
                  <div className="mt-8 border-t border-white/[0.06] pt-4">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1.5 text-cyan-400">
                        <Gem className="w-3.5 h-3.5" />
                        <span className="text-sm font-bold font-mono">{player.diamonds || 0}</span>
                        <span className="text-[9px] text-zinc-500 font-mono uppercase">Diamonds</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-green-400">
                        <Trophy className="w-3.5 h-3.5" />
                        <span className="text-sm font-bold font-mono">{totalPoints}</span>
                        <span className="text-[9px] text-zinc-500 font-mono uppercase">Tổng điểm</span>
                      </div>
                    </div>
                  </div>

                </div>

              </div>
            )}

            {/* VIEW 2: BATTLE POINT PANEL */}
            {activeTab === "battle" && (
              <div className="flex flex-col gap-6">
                <div className="glass-card p-6">
                  <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                    <History className="w-5 h-5 text-violet-400" />
                    GIẢI ĐẤU ĐÃ THAM GIA & ĐIỂM SỐ
                  </h3>
                  
                  {allStandings && allStandings.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {allStandings.map((s) => {
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
                      Bạn chưa tham gia giải đấu nào.
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
                    { label: "Số giải đã đấu", value: allStandings?.length || 0, color: "text-zinc-200", labelColor: "text-zinc-500" },
                    { label: "Tổng số Cup", value: trophies?.length || 0, color: "text-amber-400", labelColor: "text-amber-500/70" },
                    { label: "Diamonds hiện tại", value: player.diamonds || 0, color: "text-cyan-400", labelColor: "text-cyan-500/70" },
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
                      Giải đấu xuất sắc nhất: <span className="text-white font-bold">{bestTournament}</span>
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* VIEW 4: WEAPON (SHOP PURCHASES) */}
            {activeTab === "weapon" && (
              <div className="glass-card overflow-hidden">
                <div className="p-4 border-b border-white/[0.06]">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <ShoppingBag className="w-5 h-5 text-cyan-400" />
                    KHO VẬT PHẨM MUA SẮM
                  </h3>
                </div>
                {purchases && purchases.length > 0 ? (
                  <div className="divide-y divide-white/[0.04]">
                    {purchases.map((p) => (
                      <div
                        key={p.id}
                        className="px-6 py-4 flex items-center justify-between hover:bg-white/[0.01] transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-zinc-900 border border-white/[0.08] flex items-center justify-center text-cyan-400 shadow-md">
                            <Sword className="w-5 h-5" />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-sm font-bold text-zinc-200">
                              {p.shop_items?.name}
                            </span>
                            <span className="text-[10px] text-zinc-500 font-mono">
                              Ngày mua: {new Date(p.created_at).toLocaleDateString("vi-VN")}
                            </span>
                          </div>
                        </div>
                        <span className="text-xs font-mono font-bold text-rose-400 flex items-center gap-1 bg-rose-500/10 border border-rose-500/20 px-2.5 py-1 rounded-full">
                          <Gem className="w-3 h-3 text-rose-400 animate-pulse" />-{p.diamonds_spent}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-zinc-500 text-sm font-mono">
                    Kho vật phẩm trống. Hãy mua sắm ở cửa hàng!
                  </div>
                )}
              </div>
            )}

            {/* VIEW 5: MOUNT (TROPHY CASE DETAILED) */}
            {activeTab === "mount" && (
              <div className="glass-card p-6">
                <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-amber-400" />
                  KỶ VẬT TROPHY CASE
                </h3>
                <TrophyCase trophies={trophies || []} />
              </div>
            )}

            {/* VIEW 6: SOCIAL SETTINGS (EDIT FORM) */}
            {activeTab === "social" && (
              <div className="flex flex-col gap-6">
                <ProfileEditForm
                  displayName={player.display_name || ""}
                  bio={player.bio || ""}
                  socialLinks={player.social_links || {}}
                  profileBgUrl={player.profile_bg_url || ""}
                />
                <DiamondHistory transactions={transactions || []} />
              </div>
            )}

          </div>

        </div>
      )}

    </div>
  );
}
