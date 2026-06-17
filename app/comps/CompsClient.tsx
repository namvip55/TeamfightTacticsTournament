"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import tftData from "../data/tft-set17.json";
import { Crown, Sparkles, BookOpen, ChevronRight, Search } from "lucide-react";

interface CompUnit {
  apiName: string;
  name: string;
  isCarry?: boolean;
  isFlex?: boolean;
  items: string[];
  position?: number;
}

interface Comp {
  id: string;
  name: string;
  description: string;
  tier: string;
  carry_api_name: string;
  units: CompUnit[];
  traits: {
    apiName: string;
    name: string;
    count: number;
  }[];
  augments: {
    apiName?: string;
    name: string;
    image?: string;
  }[];
  early_units: {
    apiName: string;
    name: string;
  }[];
  cover_image_url: string | null;
  is_active: boolean;
  created_at: string;
}

interface CompsClientProps {
  initialComps: Comp[];
}

export default function CompsClient({ initialComps }: CompsClientProps) {
  const [comps] = useState<Comp[]>(initialComps);
  const [selectedComp, setSelectedComp] = useState<Comp | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTier, setSelectedTier] = useState<string>("ALL");

  useEffect(() => {
    // Check URL params for comp ID
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const id = params.get("id");
      if (id) {
        const found = comps.find((c) => c.id === id);
        if (found) {
          setSelectedComp(found);
          return;
        }
      }
    }
    // Default to the first active comp if none selected
    if (comps.length > 0 && !selectedComp) {
      setSelectedComp(comps[0]);
    }
  }, [comps]);

  // Filter comps
  const filteredComps = comps.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.units.some((u) => u.name.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesTier = selectedTier === "ALL" || c.tier === selectedTier;
    
    return matchesSearch && matchesTier;
  });

  const getChampInfo = (apiName: string) => {
    return tftData.champions.find((c) => c.apiName === apiName) || { name: apiName, cost: 1, image: "" };
  };

  const getItemInfo = (apiName: string) => {
    return tftData.items.find((i) => i.apiName === apiName) || { name: apiName, image: "" };
  };

  const getTraitInfo = (apiName: string) => {
    return tftData.traits.find((t) => t.apiName === apiName) || { name: apiName, image: "" };
  };

  // Helper to draw board
  const renderBoard = (comp: Comp) => {
    const slots = Array(28).fill(null);
    
    // Distribute units
    comp.units.forEach((u, index) => {
      // If position is not specified, assign to index dynamically for older comps
      const pos = u.position !== undefined ? u.position : index;
      if (pos >= 0 && pos < 28) {
        slots[pos] = u;
      }
    });

    return (
      <div className="flex flex-col gap-1 select-none w-full max-w-[620px] mx-auto p-6 bg-black/40 rounded-2xl border border-white/[0.05] backdrop-blur-md relative overflow-hidden">
        {/* Background hex pattern overlay */}
        <div className="absolute inset-0 opacity-[0.02] bg-[radial-gradient(circle_at_center,_var(--color-primary)_1px,_transparent_1px)] bg-[size:16px_16px] pointer-events-none" />

        {[0, 1, 2, 3].map((rowIdx) => {
          const isOdd = rowIdx % 2 !== 0;
          return (
            <div
              key={rowIdx}
              className={cn(
                "flex justify-center gap-2",
                isOdd ? "translate-x-[37px]" : ""
              )}
              style={{ marginTop: rowIdx > 0 ? "-15px" : "0px" }}
            >
              {[0, 1, 2, 3, 4, 5, 6].map((colIdx) => {
                const slotIdx = rowIdx * 7 + colIdx;
                const unit = slots[slotIdx];
                const champ = unit ? getChampInfo(unit.apiName) : null;

                // Determine cost border color
                const costColors: Record<number, string> = {
                  1: "border-zinc-500",
                  2: "border-emerald-500",
                  3: "border-blue-500",
                  4: "border-purple-500",
                  5: "border-amber-500",
                };
                const costBorder = champ ? costColors[champ.cost] || "border-zinc-500" : "border-zinc-800/40";

                return (
                  <div
                    key={colIdx}
                    className="relative group flex flex-col items-center"
                    style={{ width: "70px", height: "76px" }}
                  >
                    {/* Hexagon shape container */}
                    <div
                      className={cn(
                        "w-[70px] h-[76px] flex items-center justify-center transition-all duration-300 relative",
                        unit ? "scale-95" : "scale-90"
                      )}
                      style={{
                        clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)",
                      }}
                    >
                      {unit && champ ? (
                        <>
                          {/* Champion Image */}
                          {champ.image ? (
                            <img
                              src={champ.image}
                              alt={champ.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-zinc-800 flex items-center justify-center text-[10px] text-zinc-400">
                              {unit.name}
                            </div>
                          )}

                          {/* Border Glow for Carry or Flex */}
                          <div
                            className={cn(
                              "absolute inset-0 border-2 pointer-events-none rounded-[inherit]",
                              unit.isCarry
                                ? "border-amber-400 shadow-[inset_0_0_12px_rgba(245,158,11,0.6)]"
                                : unit.isFlex
                                ? "border-emerald-400 shadow-[inset_0_0_12px_rgba(34,197,90,0.6)]"
                                : costBorder
                            )}
                            style={{
                              clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)",
                            }}
                          />

                          {/* Champion Name Gradient Overlay */}
                          <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent pt-3 pb-1 flex flex-col items-center justify-end z-10">
                            <span className="text-[9px] font-bold text-white font-sans text-center leading-none px-1 truncate max-w-[62px]">
                              {champ.name || unit.name}
                            </span>
                          </div>
                        </>
                      ) : (
                        // Empty slot
                        <div
                          className="w-full h-full bg-[#141420]/30 border border-white/[0.03] transition-all hover:bg-white/[0.02]"
                          style={{
                            clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)",
                          }}
                        />
                      )}
                    </div>

                    {/* Overlapping Badges & Items */}
                    {unit && (
                      <div className="absolute -bottom-1 z-20 flex flex-col items-center gap-0.5">
                        {/* Items row */}
                        {unit.items && unit.items.length > 0 && (
                          <div className="flex gap-0.5 bg-black/60 px-1 py-0.5 rounded-full border border-white/10 scale-90">
                            {unit.items.slice(0, 3).map((itemApi: string, idx: number) => {
                              const item = getItemInfo(itemApi);
                              return (
                                <img
                                  key={idx}
                                  src={item.image || "/api/placeholder/18/18"}
                                  alt={item.name || ""}
                                  title={item.name || ""}
                                  className="w-[16px] h-[16px] object-cover rounded border border-white/20"
                                />
                              );
                            })}
                          </div>
                        )}

                        {/* Special Role indicators */}
                        {unit.isCarry && (
                          <span className="absolute -top-[70px] bg-amber-500/90 text-black text-[8px] font-extrabold px-1 rounded shadow-sm border border-amber-300">
                            CARRY
                          </span>
                        )}
                        {unit.isFlex && !unit.isCarry && (
                          <span className="absolute -top-[70px] bg-emerald-500/90 text-white text-[8px] font-extrabold px-1 rounded shadow-sm border border-emerald-300">
                            FLEX
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="glass-card p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center shadow-lg">
            <BookOpen className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">Cẩm Nang Đội Hình TFT</h1>
            <p className="text-xs text-zinc-500 font-mono">Tham khảo các lối chơi và cách sắp xếp đội hình từ cao thủ</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {["ALL", "S", "A", "B", "C"].map((tier) => (
            <button
              key={tier}
              onClick={() => setSelectedTier(tier)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-mono font-bold border transition-all cursor-pointer",
                selectedTier === tier
                  ? tier === "S"
                    ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                    : tier === "A"
                    ? "bg-blue-500/10 text-blue-400 border-blue-500/30"
                    : tier === "B"
                    ? "bg-zinc-300/10 text-zinc-300 border-zinc-300/30"
                    : tier === "C"
                    ? "bg-zinc-500/10 text-zinc-500 border-zinc-500/30"
                    : "bg-violet-500/10 text-violet-400 border-violet-500/30"
                  : "bg-white/[0.02] border-white/[0.06] text-zinc-400 hover:text-zinc-200"
              )}
            >
              {tier === "ALL" ? "Tất Cả" : `Tier ${tier}`}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* Left column: List of comps */}
        <div className="xl:col-span-4 flex flex-col gap-4">
          {/* Search bar */}
          <div className="glass-card p-4 flex items-center gap-3">
            <Search className="w-4 h-4 text-zinc-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm tên đội hình hoặc tướng..."
              className="flex-1 bg-transparent text-xs font-mono text-zinc-200 placeholder:text-zinc-600 focus:outline-none"
            />
          </div>

          {/* List panel */}
          <div className="glass-card overflow-hidden">
            <div className="p-4 border-b border-white/[0.06]">
              <span className="text-xs font-mono font-bold text-zinc-400 uppercase tracking-wider">
                Đội Hình Đang Hoạt Động ({filteredComps.length})
              </span>
            </div>

            {filteredComps.length > 0 ? (
              <div className="divide-y divide-white/[0.03] max-h-[600px] overflow-y-auto">
                {filteredComps.map((comp) => {
                  const isSelected = selectedComp?.id === comp.id;
                  const carryChamp = getChampInfo(comp.carry_api_name);
                  return (
                    <button
                      key={comp.id}
                      onClick={() => setSelectedComp(comp)}
                      className={cn(
                        "w-full p-4 flex items-center justify-between text-left transition-all cursor-pointer hover:bg-white/[0.02]",
                        isSelected ? "bg-white/[0.03] border-l-2 border-violet-500" : ""
                      )}
                    >
                      <div className="flex flex-col gap-1.5 flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span
                            className={cn(
                              "text-[9px] font-mono px-1.5 py-0.5 rounded font-bold border",
                              comp.tier === "S"
                                ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                                : comp.tier === "A"
                                ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
                                : comp.tier === "B"
                                ? "bg-zinc-300/10 text-zinc-300 border-zinc-300/20"
                                : "bg-zinc-500/10 text-zinc-500 border-zinc-500/20"
                            )}
                          >
                            T-{comp.tier}
                          </span>
                          <span className="font-bold text-sm text-zinc-200 truncate font-mono">
                            {comp.name}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5 text-xs font-mono text-zinc-500">
                          {carryChamp.image && (
                            <img
                              src={carryChamp.image}
                              alt=""
                              className="w-4 h-4 object-cover rounded"
                            />
                          )}
                          <span className="truncate">Carry: {carryChamp.name || comp.carry_api_name || "Chưa rõ"}</span>
                        </div>
                      </div>

                      <ChevronRight className={cn(
                        "w-4 h-4 text-zinc-600 transition-transform",
                        isSelected ? "text-violet-400 translate-x-1" : ""
                      )} />
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="p-8 text-center text-zinc-500 text-xs font-mono">
                Không tìm thấy đội hình nào.
              </div>
            )}
          </div>
        </div>

        {/* Right column: Detailed view with Hex grid */}
        <div className="xl:col-span-8 flex flex-col gap-6">
          {selectedComp ? (
            <div className="glass-card p-6 flex flex-col gap-6">
              {/* Comp details header */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/[0.06]">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        "text-[10px] font-mono px-2 py-0.5 rounded font-extrabold border",
                        selectedComp.tier === "S"
                          ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                          : selectedComp.tier === "A"
                          ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
                          : selectedComp.tier === "B"
                          ? "bg-zinc-300/10 text-zinc-300 border-zinc-300/20"
                          : "bg-zinc-500/10 text-zinc-500 border-zinc-500/20"
                      )}
                    >
                      Tier {selectedComp.tier}
                    </span>
                    <h2 className="text-xl font-bold text-white font-mono">{selectedComp.name}</h2>
                  </div>
                  {selectedComp.description && (
                    <p className="text-xs text-zinc-400 font-mono leading-relaxed max-w-xl">
                      {selectedComp.description}
                    </p>
                  )}
                </div>
              </div>

              {/* Hex board visualizer */}
              <div className="flex flex-col items-center gap-3">
                <span className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-violet-400" />
                  Sơ đồ sắp xếp đội hình
                </span>
                {renderBoard(selectedComp)}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-white/[0.06]">
                {/* Activation traits */}
                <div className="flex flex-col gap-3">
                  <span className="text-xs font-mono font-bold text-violet-400 uppercase tracking-wider">
                    🛡️ Tộc / Hệ kích hoạt
                  </span>
                  {selectedComp.traits && selectedComp.traits.length > 0 ? (
                    <div className="flex flex-col gap-2">
                      {selectedComp.traits.map((trait, idx) => {
                        const info = getTraitInfo(trait.apiName);
                        return (
                          <div
                            key={idx}
                            className="flex items-center justify-between p-2.5 rounded-lg bg-white/[0.01] border border-white/[0.04]"
                          >
                            <div className="flex items-center gap-2">
                              {info.image && (
                                <img
                                  src={info.image}
                                  alt=""
                                  className="w-5 h-5 object-cover"
                                />
                              )}
                              <span className="text-xs font-bold text-zinc-300 font-mono">
                                {trait.name || info.name}
                              </span>
                            </div>
                            <span className="text-xs font-mono px-2 py-0.5 rounded bg-violet-500/10 text-violet-400 border border-violet-500/20 font-bold">
                              Mốc {trait.count}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <span className="text-xs text-zinc-600 font-mono">Không có thông tin</span>
                  )}
                </div>

                {/* Augments and Early Game */}
                <div className="flex flex-col gap-6">
                  {/* Recommended Augments */}
                  <div className="flex flex-col gap-3">
                    <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider">
                      🔮 Lõi Công Nghệ Khuyên Dùng
                    </span>
                    {selectedComp.augments && selectedComp.augments.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {selectedComp.augments.map((a, idx) => (
                          <div
                            key={idx}
                            className="px-3 py-1.5 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 font-mono text-[10px] font-bold rounded-lg"
                          >
                            {a.name}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <span className="text-xs text-zinc-600 font-mono">Không có thông tin</span>
                    )}
                  </div>

                  {/* Early units */}
                  <div className="flex flex-col gap-3">
                    <span className="text-xs font-mono font-bold text-amber-500 uppercase tracking-wider">
                      ⚔️ Đội Hình Đầu Trận
                    </span>
                    {selectedComp.early_units && selectedComp.early_units.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {selectedComp.early_units.map((u, idx) => {
                          const champ = getChampInfo(u.apiName);
                          return (
                            <div
                              key={idx}
                              className="flex items-center gap-2 px-2.5 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-400 font-mono text-xs font-bold rounded-lg"
                            >
                              {champ.image && (
                                <img
                                  src={champ.image}
                                  alt=""
                                  className="w-4 h-4 object-cover rounded"
                                />
                              )}
                              <span>{u.name || champ.name}</span>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <span className="text-xs text-zinc-600 font-mono">Không có thông tin</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="glass-card p-12 text-center text-zinc-500 text-xs font-mono flex flex-col items-center justify-center gap-3">
              <Crown className="w-8 h-8 text-zinc-600 animate-pulse" />
              Chọn một đội hình bên trái để xem sơ đồ xếp tướng và lối chơi.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
