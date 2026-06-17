"use client";

import { useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  createTournamentV2Action,
  toggleRegistrationAction,
  deleteTournamentAction,
  manualScoreLobbyAction,
  autoScoreLobbyAction,
  seedMockDataAction,
  logoutAdminAction,
  kickPlayerAction,
  movePlayerAction,
  undoMatchScoreAction,
  addLobbyAction,
} from "../lib/actions";
import { createShopItemAction } from "../lib/player-actions";
import {
  createCompAction,
  updateCompAction,
  deleteCompAction,
  toggleCompAction,
  uploadCompImageAction,
} from "../lib/comp-actions";
import tftData from "../data/tft-set17.json";
import AwardDiamonds from "./AwardDiamonds";
import {
  Shield,
  LogOut,
  Plus,
  Gamepad2,
  BarChart3,
  History,
  Trophy,
  ShoppingBag,
  Loader2,
  Trash2,
  Eye,
  Lock,
  Unlock,
  Zap,
  Crown,
  UserMinus,
  ArrowRightLeft,
  Undo2,
  Sparkles,
  Gem,
  CheckCircle2,
  XCircle,
  Swords,
  Search,
} from "lucide-react";

interface Tournament {
  id: string;
  name: string;
  status: string;
  registration_open: boolean;
  locked: boolean;
  created_at: string;
  mode?: string;
  checkmate_score?: number;
  winner_riot_id?: string;
  winner_discord_id?: string;
  finished_at?: string;
}

interface Lobby {
  id: string;
  tournament_id: string;
  name: string;
  status: string;
}

interface LobbyPlayer {
  id: string;
  tournament_id: string;
  lobby_id: string;
  player_id: string;
  discord_id: string;
  riot_id: string;
  puuid: string;
  placement: number | null;
  points: number;
  match_id?: string | null;
}

interface MatchResult {
  id: string;
  tournament_id: string;
  lobby_id: string;
  match_id: string;
  created_at: string;
}

interface Standing {
  id: string;
  tournament_id: string;
  player_id: string;
  riot_id: string;
  discord_id: string;
  total_points: number;
  avg_placement: number;
  total_wins: number;
  games_played: number;
}

interface ShopItem {
  id: string;
  name: string;
  description: string | null;
  price: number;
  item_type: string;
  item_data: Record<string, any>;
  stock: number | null;
  active: boolean;
}

interface Comp {
  id: string;
  name: string;
  description: string;
  tier: string;
  carry_api_name: string;
  units: {
    apiName: string;
    name: string;
    cost: number;
    items: string[];
    isCarry?: boolean;
    isFlex?: boolean;
    position?: number;
  }[];
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

interface ClientProps {
  tournaments: Tournament[];
  lobbies: Lobby[];
  lobbyPlayers: LobbyPlayer[];
  matchResults?: MatchResult[];
  standings?: Standing[];
  shopItems?: ShopItem[];
  comps?: Comp[];
}

export default function AdminClient({
  tournaments,
  lobbies,
  lobbyPlayers,
  matchResults = [],
  standings = [],
  shopItems = [],
  comps = [],
}: ClientProps) {
  const [newTournamentName, setNewTournamentName] = useState("");
  const [newLobbyCount, setNewLobbyCount] = useState(1);
  const [newMode, setNewMode] = useState("normal");
  const [newCheckmateScore, setNewCheckmateScore] = useState(20);
  const [isCreating, setIsCreating] = useState(false);

  const [selectedTournamentId, setSelectedTournamentId] =
    useState<string>("");
  const [selectedLobbyId, setSelectedLobbyId] = useState<string>("");
  const [scoringPlacements, setScoringPlacements] = useState<
    Record<string, number>
  >({});
  const [isSubmittingScore, setIsSubmittingScore] = useState(false);
  const [isAutoScoring, setIsAutoScoring] = useState(false);

  const [moveTargetLobbyId, setMoveTargetLobbyId] = useState<string>("");
  const [undoMatchId, setUndoMatchId] = useState("");
  const [isUndoing, setIsUndoing] = useState(false);

  const [message, setMessage] = useState<{
    text: string;
    type: "success" | "error";
  } | null>(null);
  const [isSeeding, setIsSeeding] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isAddingLobby, setIsAddingLobby] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "manage" | "scoring" | "history" | "award" | "shop" | "comps"
  >("manage");

  // Comps Tab State
  const [compName, setCompName] = useState("");
  const [compDescription, setCompDescription] = useState("");
  const [compTier, setCompTier] = useState("A");
  const [compCarryApiName, setCompCarryApiName] = useState("");
  const [compCoverImageUrl, setCompCoverImageUrl] = useState("");
  const [compIsActive, setCompIsActive] = useState(true);
  const [compUnits, setCompUnits] = useState<{ apiName: string; name: string; isCarry: boolean; isFlex: boolean; items: string[]; position?: number }[]>([]);
  const [compTraits, setCompTraits] = useState<{ apiName: string; name: string; count: number }[]>([]);
  const [compAugments, setCompAugments] = useState<{ name: string }[]>([]);
  const [compEarlyUnits, setCompEarlyUnits] = useState<{ apiName: string; name: string }[]>([]);
  const [editingCompId, setEditingCompId] = useState<string | null>(null);
  const [isSubmittingComp, setIsSubmittingComp] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);
  const [champSearch, setChampSearch] = useState("");

  const [newItemName, setNewItemName] = useState("");
  const [newItemDesc, setNewItemDesc] = useState("");
  const [newItemPrice, setNewItemPrice] = useState(50);
  const [newItemType, setNewItemType] = useState("badge");
  const [isCreatingItem, setIsCreatingItem] = useState(false);

  const selectedTournament = tournaments.find(
    (t) => t.id === selectedTournamentId
  );
  const activeLobbies = lobbies.filter(
    (l) => l.tournament_id === selectedTournamentId
  );
  const currentLobby =
    activeLobbies.find((l) => l.id === selectedLobbyId) || activeLobbies[0];
  const playersInLobby = currentLobby
    ? lobbyPlayers.filter((lp) => lp.lobby_id === currentLobby.id)
    : [];
  const tournamentMatchResults = matchResults.filter(
    (m) => m.tournament_id === selectedTournamentId
  );
  const tournamentStandings = standings.filter(
    (s) => s.tournament_id === selectedTournamentId
  );

  const handleTournamentSelect = (id: string) => {
    setSelectedTournamentId(id);
    setSelectedLobbyId("");
    setScoringPlacements({});
  };

  const handleCreateTournament = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTournamentName.trim()) return;
    setIsCreating(true);
    setMessage(null);
    const result = await createTournamentV2Action(
      newTournamentName,
      newLobbyCount,
      newMode,
      newCheckmateScore
    );
    setIsCreating(false);
    if (result.success) {
      setNewTournamentName("");
      setNewLobbyCount(1);
      setMessage({
        text: `Đã tạo giải đấu "${result.tournament.name}" với ${result.lobbies?.length || 0} lobby!`,
        type: "success",
      });
    } else {
      setMessage({ text: `Lỗi: ${result.error}`, type: "error" });
    }
  };

  const handleToggleRegistration = async (
    id: string,
    currentStatus: boolean
  ) => {
    setMessage(null);
    const result = await toggleRegistrationAction(id, !currentStatus);
    if (result.success) {
      setMessage({
        text: `Đã ${!currentStatus ? "MỞ" : "ĐÓNG"} đăng ký!`,
        type: "success",
      });
    } else {
      setMessage({ text: `Lỗi: ${result.error}`, type: "error" });
    }
  };

  const handleDeleteTournament = async (id: string, name: string) => {
    if (!confirm(`Xóa giải đấu "${name}" và toàn bộ dữ liệu?`)) return;
    setMessage(null);
    const result = await deleteTournamentAction(id);
    if (result.success) {
      if (selectedTournamentId === id) setSelectedTournamentId("");
      setMessage({ text: `Đã xóa "${name}"!`, type: "success" });
    } else {
      setMessage({ text: `Lỗi: ${result.error}`, type: "error" });
    }
  };

  const handleManualScoreSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentLobby) return;
    setIsSubmittingScore(true);
    setMessage(null);
    const result = await manualScoreLobbyAction(
      selectedTournamentId,
      currentLobby.id,
      scoringPlacements
    );
    setIsSubmittingScore(false);
    if (result.success) {
      setMessage({ text: result.message || "Đã lưu điểm!", type: "success" });
      setScoringPlacements({});
    } else {
      setMessage({ text: `Lỗi: ${result.error}`, type: "error" });
    }
  };

  const handleAutoScore = async () => {
    if (!currentLobby) return;
    setIsAutoScoring(true);
    setMessage(null);
    const result = await autoScoreLobbyAction(
      selectedTournamentId,
      currentLobby.id
    );
    setIsAutoScoring(false);
    if (result.success) {
      setMessage({
        text: result.message || "Tính điểm thành công!",
        type: "success",
      });
    } else {
      setMessage({ text: `Lỗi: ${result.error}`, type: "error" });
    }
  };

  const handleKickPlayer = async (discordId: string, riotId: string) => {
    if (!confirm(`Kick ${riotId}?`)) return;
    setMessage(null);
    const result = await kickPlayerAction(
      selectedTournamentId,
      currentLobby.id,
      discordId
    );
    if (result.success) {
      setMessage({ text: result.message || "Đã kick!", type: "success" });
    } else {
      setMessage({ text: `Lỗi: ${result.error}`, type: "error" });
    }
  };

  const handleMovePlayer = async (discordId: string, riotId: string) => {
    if (!moveTargetLobbyId) {
      setMessage({ text: "Chọn lobby đích!", type: "error" });
      return;
    }
    setMessage(null);
    const result = await movePlayerAction(
      selectedTournamentId,
      discordId,
      moveTargetLobbyId
    );
    if (result.success) {
      setMessage({ text: result.message || "Đã chuyển!", type: "success" });
      setMoveTargetLobbyId("");
    } else {
      setMessage({ text: `Lỗi: ${result.error}`, type: "error" });
    }
  };

  const handleUndoScore = async () => {
    if (!undoMatchId.trim()) return;
    setIsUndoing(true);
    setMessage(null);
    const result = await undoMatchScoreAction(undoMatchId.trim());
    setIsUndoing(false);
    if (result.success) {
      setMessage({ text: result.message || "Đã undo!", type: "success" });
      setUndoMatchId("");
    } else {
      setMessage({ text: `Lỗi: ${result.error}`, type: "error" });
    }
  };

  const handleAddLobby = async () => {
    if (!selectedTournamentId) return;
    setIsAddingLobby(true);
    setMessage(null);
    const result = await addLobbyAction(selectedTournamentId);
    setIsAddingLobby(false);
    if (result.success) {
      setMessage({ text: result.message || "Đã thêm!", type: "success" });
    } else {
      setMessage({ text: `Lỗi: ${result.error}`, type: "error" });
    }
  };

  const handleSeedMockData = async () => {
    setIsSeeding(true);
    setMessage(null);
    const result = await seedMockDataAction();
    setIsSeeding(false);
    if (result.success) {
      setMessage({
        text: result.message || "Đã seed dữ liệu mẫu!",
        type: "success",
      });
    } else {
      setMessage({ text: `Lỗi: ${result.error}`, type: "error" });
    }
  };

  const handleCreateShopItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim()) return;
    setIsCreatingItem(true);
    setMessage(null);
    const result = await createShopItemAction({
      name: newItemName,
      description: newItemDesc,
      price: newItemPrice,
      item_type: newItemType,
    });
    setIsCreatingItem(false);
    if (result.success) {
      setNewItemName("");
      setNewItemDesc("");
      setNewItemPrice(50);
      setMessage({ text: "Đã tạo vật phẩm!", type: "success" });
    } else {
      setMessage({ text: `Lỗi: ${result.error}`, type: "error" });
    }
  };

  const handleCreateOrUpdateComp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!compName.trim()) return;

    setIsSubmittingComp(true);
    setMessage(null);

    const compData = {
      name: compName,
      description: compDescription,
      tier: compTier,
      carry_api_name: compCarryApiName || (compUnits.find(u => u.isCarry)?.apiName || ""),
      units: compUnits,
      traits: compTraits,
      augments: compAugments,
      early_units: compEarlyUnits,
      cover_image_url: compCoverImageUrl || null,
      is_active: compIsActive,
    };

    let result;
    if (editingCompId) {
      result = await updateCompAction(editingCompId, compData);
    } else {
      result = await createCompAction(compData);
    }

    setIsSubmittingComp(false);
    if (result.success) {
      setMessage({
        text: editingCompId ? "Đã cập nhật đội hình!" : "Đã tạo đội hình mới!",
        type: "success",
      });
      // Reset form
      setCompName("");
      setCompDescription("");
      setCompTier("A");
      setCompCarryApiName("");
      setCompCoverImageUrl("");
      setCompIsActive(true);
      setCompUnits([]);
      setCompTraits([]);
      setCompAugments([]);
      setCompEarlyUnits([]);
      setEditingCompId(null);
      setSelectedSlot(null);
    } else {
      setMessage({ text: `Lỗi: ${result.error}`, type: "error" });
    }
  };

  const handleEditCompClick = (comp: Comp) => {
    setEditingCompId(comp.id);
    setCompName(comp.name);
    setCompDescription(comp.description || "");
    setCompTier(comp.tier || "A");
    setCompCarryApiName(comp.carry_api_name || "");
    setCompCoverImageUrl(comp.cover_image_url || "");
    setCompIsActive(comp.is_active);
    setCompUnits((comp.units || []).map((u, idx) => ({ ...u, isCarry: u.isCarry ?? false, isFlex: u.isFlex ?? false, position: u.position !== undefined ? u.position : idx })));
    setCompTraits(comp.traits || []);
    setCompAugments(comp.augments || []);
    setCompEarlyUnits(comp.early_units || []);
    setSelectedSlot(null);
    setActiveTab("comps"); // Switch tab
  };

  const handleDeleteComp = async (id: string, name: string) => {
    if (!confirm(`Xóa đội hình "${name}"?`)) return;
    setMessage(null);
    const result = await deleteCompAction(id);
    if (result.success) {
      setMessage({ text: `Đã xóa đội hình "${name}"!`, type: "success" });
    } else {
      setMessage({ text: `Lỗi: ${result.error}`, type: "error" });
    }
  };

  const handleToggleCompActive = async (id: string, current: boolean) => {
    setMessage(null);
    const result = await toggleCompAction(id, !current);
    if (result.success) {
      setMessage({ text: `Đã ${!current ? "kích hoạt" : "ẩn"} đội hình!`, type: "success" });
    } else {
      setMessage({ text: `Lỗi: ${result.error}`, type: "error" });
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    setMessage(null);

    const formData = new FormData();
    formData.append("file", file);

    const result = await uploadCompImageAction(formData);
    setUploadingImage(false);

    if (result.success && result.url) {
      setCompCoverImageUrl(result.url);
      setMessage({ text: "Tải ảnh lên thành công!", type: "success" });
    } else {
      setMessage({ text: `Lỗi tải ảnh: ${result.error}`, type: "error" });
    }
  };


  const handleLogout = async () => {
    setIsLoggingOut(true);
    const result = await logoutAdminAction();
    if (result.success) {
      window.location.href = "/";
    } else {
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Admin Status Bar */}
      <div className="glass-card p-4 flex items-center justify-between">
        <div className="flex items-center gap-2 text-green-400 font-mono text-xs font-bold">
          <span className="w-2 h-2 bg-green-400 rounded-full neon-pulse" />
          Đã đăng nhập quyền Quản trị viên
        </div>
        <button
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="px-4 py-1.5 bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded-lg hover:bg-rose-500/20 font-bold text-xs transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-2"
        >
          <LogOut className="w-3.5 h-3.5" />
          {isLoggingOut ? "Đang đăng xuất..." : "Đăng Xuất"}
        </button>
      </div>

      {/* Seed Mock Banner */}
      <section className="glass-card p-6 flex flex-col md:flex-row items-center justify-between gap-6 border-violet-500/20">
        <div className="flex-1 flex flex-col gap-1.5">
          <span className="text-[10px] text-violet-400 font-mono uppercase tracking-widest font-bold flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            Trải Nghiệm Thử
          </span>
          <h3 className="text-lg font-semibold text-white">
            Khởi tạo dữ liệu mẫu
          </h3>
          <p className="text-xs text-zinc-500 leading-relaxed max-w-2xl font-mono">
            Tạo giải đấu mẫu với 8 cờ thủ, điểm số và BXH.
          </p>
        </div>
        <button
          onClick={handleSeedMockData}
          disabled={isSeeding}
          className="w-full md:w-auto px-6 py-2.5 bg-gradient-to-r from-violet-600 to-violet-500 hover:from-violet-500 hover:to-violet-400 text-white font-bold rounded-lg transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2 whitespace-nowrap text-sm neon-glow"
        >
          {isSeeding ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Đang Khởi Tạo...
            </>
          ) : (
            "Khởi Tạo Dữ Liệu Mẫu"
          )}
        </button>
      </section>

      {/* Messages */}
      {message && (
        <div
          className={cn(
            "p-4 rounded-lg border text-xs font-mono flex items-center gap-2",
            message.type === "success"
              ? "bg-green-500/10 text-green-400 border-green-500/20"
              : "bg-rose-500/10 text-rose-400 border-rose-500/20"
          )}
        >
          {message.type === "success" ? (
            <CheckCircle2 className="w-4 h-4" />
          ) : (
            <XCircle className="w-4 h-4" />
          )}
          <span className="flex-1">{message.text}</span>
          <button
            onClick={() => setMessage(null)}
            className="text-zinc-500 hover:text-zinc-300 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Main Content */}
      <section className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* Left: Create + Tournament List */}
        <div className="xl:col-span-4 flex flex-col gap-4">
          {/* Create Tournament */}
          <div className="glass-card p-5 flex flex-col gap-4">
            <h3 className="text-xs font-mono font-bold tracking-wide uppercase text-violet-400 flex items-center gap-2">
              <Plus className="w-3.5 h-3.5" />
              Tạo Giải Đấu Mới
            </h3>
            <form
              onSubmit={handleCreateTournament}
              className="flex flex-col gap-3"
            >
              <input
                type="text"
                value={newTournamentName}
                onChange={(e) => setNewTournamentName(e.target.value)}
                placeholder="Tên giải đấu..."
                required
                disabled={isCreating}
                className="w-full bg-white/[0.03] border border-white/[0.08] rounded-lg px-3 py-2 text-sm font-mono text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-violet-500/50"
              />
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] text-zinc-500 font-mono uppercase font-bold">
                    Số Lobby
                  </label>
                  <input
                    type="number"
                    value={newLobbyCount}
                    onChange={(e) =>
                      setNewLobbyCount(
                        Math.max(1, Math.min(32, Number(e.target.value)))
                      )
                    }
                    min={1}
                    max={32}
                    className="bg-white/[0.03] border border-white/[0.08] rounded-lg px-3 py-2 text-sm font-mono text-zinc-200 focus:outline-none focus:border-violet-500/50"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] text-zinc-500 font-mono uppercase font-bold">
                    Chế độ
                  </label>
                  <select
                    value={newMode}
                    onChange={(e) => setNewMode(e.target.value)}
                    className="bg-white/[0.03] border border-white/[0.08] rounded-lg px-3 py-2 text-sm font-mono text-zinc-200 focus:outline-none focus:border-violet-500/50 cursor-pointer"
                  >
                    <option value="normal">Giải thường</option>
                    <option value="checkmate">Checkmate</option>
                  </select>
                </div>
              </div>
              {newMode === "checkmate" && (
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] text-zinc-500 font-mono uppercase font-bold">
                    Mốc điểm Checkmate
                  </label>
                  <input
                    type="number"
                    value={newCheckmateScore}
                    onChange={(e) =>
                      setNewCheckmateScore(Math.max(1, Number(e.target.value)))
                    }
                    min={1}
                    max={999}
                    className="bg-white/[0.03] border border-white/[0.08] rounded-lg px-3 py-2 text-sm font-mono text-zinc-200 focus:outline-none focus:border-violet-500/50"
                  />
                </div>
              )}
              <button
                type="submit"
                disabled={isCreating || !newTournamentName.trim()}
                className="w-full py-2 bg-gradient-to-r from-violet-600 to-violet-500 hover:from-violet-500 hover:to-violet-400 text-white font-semibold rounded-lg transition-all cursor-pointer disabled:opacity-50 text-sm"
              >
                {isCreating ? "Đang tạo..." : "Tạo Giải Đấu"}
              </button>
            </form>
          </div>

          {/* Tournament List */}
          <div className="glass-card overflow-hidden flex-1">
            <div className="p-4 border-b border-white/[0.06]">
              <h3 className="text-xs font-mono font-bold tracking-wide uppercase text-zinc-400 flex items-center gap-2">
                <Trophy className="w-3.5 h-3.5 text-violet-400" />
                Giải Đấu ({tournaments.length})
              </h3>
            </div>
            {tournaments.length > 0 ? (
              <div className="max-h-[500px] overflow-y-auto">
                {tournaments.map((t) => (
                  <div
                    key={t.id}
                    onClick={() => handleTournamentSelect(t.id)}
                    className={cn(
                      "p-4 border-b border-white/[0.03] cursor-pointer transition-colors hover:bg-white/[0.03]",
                      selectedTournamentId === t.id &&
                        "bg-violet-500/[0.05] border-l-2 border-l-violet-500"
                    )}
                  >
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="font-bold text-zinc-200 text-sm line-clamp-1 flex-1">
                        {t.name}
                      </span>
                      <span
                        className={cn(
                          "text-[9px] font-bold px-2 py-0.5 rounded-full border uppercase whitespace-nowrap",
                          t.status === "registration_open"
                            ? "bg-green-500/10 text-green-400 border-green-500/20"
                            : t.status === "active"
                            ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                            : "bg-zinc-500/10 text-zinc-400 border-zinc-500/20"
                        )}
                      >
                        {t.status === "registration_open"
                          ? "Mở"
                          : t.status === "active"
                          ? "Đấu"
                          : "Xong"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-zinc-500 font-mono">
                      <span>
                        {new Date(t.created_at).toLocaleDateString("vi-VN")}
                      </span>
                      {t.mode === "checkmate" && (
                        <span className="px-1.5 py-0.5 bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded font-bold flex items-center gap-1">
                          <Swords className="w-2.5 h-2.5" />
                          CHECKMATE
                        </span>
                      )}
                    </div>
                    {t.winner_riot_id && (
                      <div className="mt-1.5 text-[10px] text-amber-400 font-mono font-bold flex items-center gap-1">
                        <Crown className="w-3 h-3" />
                        Vô địch: {t.winner_riot_id}
                      </div>
                    )}
                    <div
                      className="flex gap-2 mt-2"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        onClick={() =>
                          handleToggleRegistration(t.id, t.registration_open)
                        }
                        className={cn(
                          "px-2 py-1 rounded text-[10px] border font-bold transition-colors cursor-pointer flex items-center gap-1",
                          t.registration_open
                            ? "bg-rose-500/10 text-rose-400 border-rose-500/20 hover:bg-rose-500/20"
                            : "bg-green-500/10 text-green-400 border-green-500/20 hover:bg-green-500/20"
                        )}
                      >
                        {t.registration_open ? (
                          <>
                            <Lock className="w-2.5 h-2.5" /> Khóa
                          </>
                        ) : (
                          <>
                            <Unlock className="w-2.5 h-2.5" /> Mở
                          </>
                        )}
                      </button>
                      <Link
                        href={`/tournaments/${t.id}`}
                        className="px-2 py-1 rounded text-[10px] border border-white/[0.06] bg-white/[0.02] text-zinc-400 hover:text-zinc-200 hover:border-violet-500/30 font-bold transition-colors flex items-center gap-1"
                      >
                        <Eye className="w-2.5 h-2.5" /> Xem
                      </Link>
                      <button
                        onClick={() => handleDeleteTournament(t.id, t.name)}
                        className="px-2 py-1 rounded text-[10px] border border-white/[0.06] bg-white/[0.02] text-zinc-500 hover:bg-rose-500/10 hover:text-rose-400 hover:border-rose-500/30 font-bold transition-colors cursor-pointer flex items-center gap-1"
                      >
                        <Trash2 className="w-2.5 h-2.5" /> Xóa
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-zinc-500 text-xs">
                Chưa có giải đấu.
              </div>
            )}
          </div>
        </div>

        {/* Right: Management Tabs */}
        <div className="xl:col-span-8 flex flex-col gap-4">
          {selectedTournamentId ? (
            <>
              <Tabs
                value={activeTab}
                onValueChange={(v) => setActiveTab(v as any)}
              >
                <TabsList className="bg-white/[0.03] border border-white/[0.08] p-1 h-auto flex-wrap">
                  <TabsTrigger
                    value="manage"
                    className="data-[state=active]:bg-violet-500/10 data-[state=active]:text-violet-400 text-zinc-400 border border-transparent px-4 py-2 text-xs font-mono font-bold rounded-lg"
                  >
                    <Gamepad2 className="w-3.5 h-3.5 mr-1.5" />
                    Quản Lý Lobby
                  </TabsTrigger>
                  <TabsTrigger
                    value="scoring"
                    className="data-[state=active]:bg-violet-500/10 data-[state=active]:text-violet-400 text-zinc-400 border border-transparent px-4 py-2 text-xs font-mono font-bold rounded-lg"
                  >
                    <Zap className="w-3.5 h-3.5 mr-1.5" />
                    Tính Điểm
                  </TabsTrigger>
                  <TabsTrigger
                    value="history"
                    className="data-[state=active]:bg-violet-500/10 data-[state=active]:text-violet-400 text-zinc-400 border border-transparent px-4 py-2 text-xs font-mono font-bold rounded-lg"
                  >
                    <History className="w-3.5 h-3.5 mr-1.5" />
                    Lịch Sử ({tournamentMatchResults.length})
                  </TabsTrigger>
                  <TabsTrigger
                    value="award"
                    className="data-[state=active]:bg-amber-500/10 data-[state=active]:text-amber-400 text-zinc-400 border border-transparent px-4 py-2 text-xs font-mono font-bold rounded-lg"
                  >
                    <Crown className="w-3.5 h-3.5 mr-1.5" />
                    Trao Giải
                  </TabsTrigger>
                  <TabsTrigger
                    value="shop"
                    className="data-[state=active]:bg-cyan-500/10 data-[state=active]:text-cyan-400 text-zinc-400 border border-transparent px-4 py-2 text-xs font-mono font-bold rounded-lg"
                  >
                    <ShoppingBag className="w-3.5 h-3.5 mr-1.5" />
                    Shop ({shopItems.length})
                  </TabsTrigger>

                </TabsList>

                {/* Selected Tournament Info */}
                <div className="glass-card p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-4">
                  <div className="flex flex-col gap-1">
                    <span className="text-[9px] text-zinc-500 font-mono uppercase tracking-wider">
                      Đang Chọn
                    </span>
                    <span className="text-sm font-bold text-white">
                      {selectedTournament?.name}
                    </span>
                    <div className="flex items-center gap-2 text-[10px] font-mono text-zinc-500">
                      {selectedTournament?.mode === "checkmate" && (
                        <span className="px-1.5 py-0.5 bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded font-bold flex items-center gap-1">
                          <Swords className="w-2.5 h-2.5" />
                          CHECKMATE ({selectedTournament.checkmate_score}đ)
                        </span>
                      )}
                      <span>{activeLobbies.length} lobby</span>
                    </div>
                  </div>
                  <Link
                    href={`/tournaments/${selectedTournamentId}`}
                    className="px-3 py-1.5 bg-white/[0.04] border border-white/[0.08] rounded-lg text-xs font-mono font-bold text-zinc-300 hover:text-white hover:border-violet-500/30 transition-colors flex items-center gap-1"
                  >
                    <Eye className="w-3 h-3" /> Xem BXH →
                  </Link>
                </div>

                {/* TAB: MANAGE LOBBIES */}
                <TabsContent value="manage" className="mt-4">
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-3 flex-wrap">
                      {activeLobbies.map((lobby) => {
                        const pCount = lobbyPlayers.filter(
                          (lp) => lp.lobby_id === lobby.id
                        ).length;
                        return (
                          <button
                            key={lobby.id}
                            onClick={() => {
                              setSelectedLobbyId(lobby.id);
                              setScoringPlacements({});
                            }}
                            className={cn(
                              "px-4 py-2 rounded-lg border text-xs font-mono font-bold transition-colors cursor-pointer",
                              (selectedLobbyId || activeLobbies[0]?.id) ===
                                lobby.id
                                ? "bg-violet-500/10 text-violet-400 border-violet-500/20"
                                : "bg-white/[0.02] text-zinc-300 border-white/[0.06] hover:border-violet-500/30"
                            )}
                          >
                            {lobby.name} ({pCount}/8)
                          </button>
                        );
                      })}
                      <button
                        onClick={handleAddLobby}
                        disabled={isAddingLobby}
                        className="px-4 py-2 rounded-lg border border-dashed border-violet-500/30 text-xs font-mono font-bold text-violet-400 hover:bg-violet-500/5 transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-1"
                      >
                        <Plus className="w-3 h-3" />
                        {isAddingLobby ? "..." : "Thêm Lobby"}
                      </button>
                    </div>

                    {currentLobby && (
                      <div className="glass-card overflow-hidden">
                        <div className="p-4 border-b border-white/[0.06] flex items-center justify-between">
                          <h4 className="text-sm font-mono font-bold text-zinc-200">
                            {currentLobby.name} — {playersInLobby.length}/8
                            tuyển thủ
                          </h4>
                        </div>
                        {playersInLobby.length > 0 ? (
                          <div className="divide-y divide-white/[0.03]">
                            {playersInLobby.map((player) => (
                              <div
                                key={player.id}
                                className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-white/[0.02] transition-colors"
                              >
                                <div className="flex flex-col gap-1">
                                  <div className="flex items-center gap-2">
                                    <span className="font-mono font-bold text-sm text-zinc-200">
                                      {player.riot_id}
                                    </span>
                                    {player.placement !== null && (
                                      <span
                                        className={cn(
                                          "text-[10px] font-mono font-bold px-2 py-0.5 rounded",
                                          player.placement === 1
                                            ? "bg-amber-500/20 text-amber-400"
                                            : player.placement <= 4
                                            ? "bg-cyan-500/10 text-cyan-400"
                                            : "bg-white/[0.04] text-zinc-500"
                                        )}
                                      >
                                        Top {player.placement} (+
                                        {player.points}đ)
                                      </span>
                                    )}
                                  </div>
                                  <span className="text-[10px] text-zinc-500 font-mono">
                                    Discord: @{player.discord_id}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <select
                                    value={moveTargetLobbyId}
                                    onChange={(e) =>
                                      setMoveTargetLobbyId(e.target.value)
                                    }
                                    className="bg-white/[0.03] border border-white/[0.08] rounded px-2 py-1.5 text-[10px] font-mono text-zinc-300 cursor-pointer focus:outline-none focus:border-violet-500/50"
                                  >
                                    <option value="">Chuyển đến...</option>
                                    {activeLobbies
                                      .filter((l) => l.id !== currentLobby.id)
                                      .map((l) => {
                                        const cnt = lobbyPlayers.filter(
                                          (lp) => lp.lobby_id === l.id
                                        ).length;
                                        return (
                                          <option key={l.id} value={l.id}>
                                            {l.name} ({cnt}/8)
                                          </option>
                                        );
                                      })}
                                  </select>
                                  <button
                                    onClick={() =>
                                      handleMovePlayer(
                                        player.discord_id,
                                        player.riot_id
                                      )
                                    }
                                    disabled={!moveTargetLobbyId}
                                    className="px-3 py-1.5 bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 rounded text-[10px] font-mono font-bold hover:bg-cyan-500/20 transition-colors cursor-pointer disabled:opacity-40 flex items-center gap-1"
                                  >
                                    <ArrowRightLeft className="w-3 h-3" />
                                    Chuyển
                                  </button>
                                  <button
                                    onClick={() =>
                                      handleKickPlayer(
                                        player.discord_id,
                                        player.riot_id
                                      )
                                    }
                                    className="px-3 py-1.5 bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded text-[10px] font-mono font-bold hover:bg-rose-500/20 transition-colors cursor-pointer flex items-center gap-1"
                                  >
                                    <UserMinus className="w-3 h-3" />
                                    Kick
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="p-8 text-center text-zinc-500 text-xs font-mono">
                            Lobby chưa có tuyển thủ nào.
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </TabsContent>

                {/* TAB: SCORING */}
                <TabsContent value="scoring" className="mt-4">
                  <div className="flex flex-col gap-6">
                    <div className="flex items-center gap-3 flex-wrap">
                      {activeLobbies.map((lobby) => {
                        const pCount = lobbyPlayers.filter(
                          (lp) => lp.lobby_id === lobby.id
                        ).length;
                        return (
                          <button
                            key={lobby.id}
                            onClick={() => {
                              setSelectedLobbyId(lobby.id);
                              setScoringPlacements({});
                            }}
                            className={cn(
                              "px-4 py-2 rounded-lg border text-xs font-mono font-bold transition-colors cursor-pointer",
                              (selectedLobbyId || activeLobbies[0]?.id) ===
                                lobby.id
                                ? "bg-violet-500/10 text-violet-400 border-violet-500/20"
                                : "bg-white/[0.02] text-zinc-300 border-white/[0.06] hover:border-violet-500/30"
                            )}
                          >
                            {lobby.name} ({pCount}/8)
                          </button>
                        );
                      })}
                    </div>

                    {currentLobby && (
                      <>
                        {playersInLobby.length < 8 ? (
                          <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg text-xs text-zinc-400 font-mono">
                            ⚠ Cần đủ 8 cờ thủ trong {currentLobby.name} để
                            tính điểm. Hiện tại: {playersInLobby.length}/8
                          </div>
                        ) : (
                          <>
                            <div className="glass-card p-4 border-cyan-500/20 flex flex-col gap-3">
                              <span className="text-[10px] font-bold text-cyan-400 font-mono uppercase tracking-wider flex items-center gap-1">
                                <Zap className="w-3 h-3" />
                                Cách A: Tính Điểm Riot API Tự Động
                              </span>
                              <p className="text-[11px] text-zinc-500 font-mono">
                                Quét trận chung gần nhất của 8 cờ thủ.
                              </p>
                              <button
                                onClick={handleAutoScore}
                                disabled={isAutoScoring}
                                className="w-full py-2 bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 text-white font-bold text-xs rounded-lg transition-all cursor-pointer flex items-center justify-center gap-2"
                              >
                                {isAutoScoring ? (
                                  <>
                                    <Loader2 className="w-3 h-3 animate-spin" />
                                    Đang Quét API...
                                  </>
                                ) : (
                                  "Quét & Tính Điểm Riot API"
                                )}
                              </button>
                            </div>

                            <div className="flex flex-col gap-3">
                              <span className="text-[10px] font-bold text-violet-400 font-mono uppercase tracking-wider">
                                Cách B: Nhập Thứ Hạng Thủ Công
                              </span>
                              <form
                                onSubmit={handleManualScoreSubmit}
                                className="flex flex-col gap-3"
                              >
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                  {playersInLobby.map((player) => (
                                    <div
                                      key={player.player_id}
                                      className="flex items-center justify-between bg-white/[0.02] p-2.5 rounded-lg border border-white/[0.06] text-xs font-mono"
                                    >
                                      <span className="font-semibold text-zinc-200 truncate max-w-[140px]">
                                        {player.riot_id}
                                      </span>
                                      <select
                                        value={
                                          scoringPlacements[
                                            player.player_id
                                          ] || ""
                                        }
                                        required
                                        onChange={(e) =>
                                          setScoringPlacements((prev) => ({
                                            ...prev,
                                            [player.player_id]: Number(
                                              e.target.value
                                            ),
                                          }))
                                        }
                                        className="bg-white/[0.03] border border-white/[0.08] rounded px-2 py-1 text-zinc-200 outline-none focus:border-violet-500/50 cursor-pointer"
                                      >
                                        <option value="">Hạng...</option>
                                        {[1, 2, 3, 4, 5, 6, 7, 8].map(
                                          (n) => (
                                            <option key={n} value={n}>
                                              Top {n} ({9 - n}đ)
                                            </option>
                                          )
                                        )}
                                      </select>
                                    </div>
                                  ))}
                                </div>
                                <button
                                  type="submit"
                                  disabled={isSubmittingScore}
                                  className="w-full py-2.5 bg-gradient-to-r from-violet-600 to-violet-500 hover:from-violet-500 hover:to-violet-400 text-white font-bold text-xs rounded-lg transition-all cursor-pointer"
                                >
                                  {isSubmittingScore
                                    ? "Đang lưu..."
                                    : "Lưu Kết Quả & Cập Nhật BXH"}
                                </button>
                              </form>
                            </div>
                          </>
                        )}
                      </>
                    )}

                    <div className="glass-card p-4 border-rose-500/20 flex flex-col gap-3">
                      <span className="text-[10px] font-bold text-rose-400 font-mono uppercase tracking-wider flex items-center gap-1">
                        <Undo2 className="w-3 h-3" />
                        Undo Điểm Trận Đấu
                      </span>
                      <p className="text-[11px] text-zinc-500 font-mono">
                        Xóa kết quả một trận đã tính sai.
                      </p>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={undoMatchId}
                          onChange={(e) => setUndoMatchId(e.target.value)}
                          placeholder="Match ID (VN2_1408009990)"
                          className="flex-1 bg-white/[0.03] border border-white/[0.08] rounded-lg px-3 py-2 text-xs font-mono text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-rose-500/50"
                        />
                        <button
                          onClick={handleUndoScore}
                          disabled={isUndoing || !undoMatchId.trim()}
                          className="px-4 py-2 bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded-lg text-xs font-mono font-bold hover:bg-rose-500/20 transition-colors cursor-pointer disabled:opacity-50"
                        >
                          {isUndoing ? "Đang undo..." : "Undo"}
                        </button>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                {/* TAB: MATCH HISTORY */}
                <TabsContent value="history" className="mt-4">
                  <div className="flex flex-col gap-4">
                    {tournamentMatchResults.length > 0 ? (
                      <div className="glass-card overflow-hidden">
                        <div className="p-4 border-b border-white/[0.06]">
                          <h4 className="text-sm font-mono font-bold text-zinc-200 flex items-center gap-2">
                            <History className="w-4 h-4 text-violet-400" />
                            Kết Quả Trận Đấu (
                            {tournamentMatchResults.length})
                          </h4>
                        </div>
                        <div className="divide-y divide-white/[0.03]">
                          {tournamentMatchResults.map((mr) => {
                            const lobby = lobbies.find(
                              (l) => l.id === mr.lobby_id
                            );
                            const players = lobbyPlayers.filter(
                              (lp) => lp.match_id === mr.match_id
                            );
                            return (
                              <div
                                key={mr.id}
                                className="p-4 hover:bg-white/[0.02] transition-colors"
                              >
                                <div className="flex items-center justify-between mb-2">
                                  <div className="flex items-center gap-2">
                                    <span className="font-mono font-bold text-xs text-zinc-200">
                                      {mr.match_id}
                                    </span>
                                    <span className="text-[10px] text-zinc-500 font-mono">
                                      {lobby?.name || "N/A"} •{" "}
                                      {new Date(
                                        mr.created_at
                                      ).toLocaleString("vi-VN")}
                                    </span>
                                  </div>
                                  <button
                                    onClick={() => {
                                      setUndoMatchId(mr.match_id);
                                      setActiveTab("scoring");
                                    }}
                                    className="px-2 py-1 bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded text-[10px] font-mono font-bold hover:bg-rose-500/20 transition-colors cursor-pointer flex items-center gap-1"
                                  >
                                    <Undo2 className="w-3 h-3" />
                                    Undo
                                  </button>
                                </div>
                                {players.length > 0 && (
                                  <div className="flex flex-wrap gap-2">
                                    {players
                                      .sort(
                                        (a, b) =>
                                          (a.placement || 99) -
                                          (b.placement || 99)
                                      )
                                      .map((p) => (
                                        <span
                                          key={p.id}
                                          className={cn(
                                            "text-[10px] font-mono px-2 py-1 rounded",
                                            p.placement === 1
                                              ? "bg-amber-500/20 text-amber-400 font-bold"
                                              : p.placement &&
                                                p.placement <= 4
                                              ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"
                                              : "bg-white/[0.02] text-zinc-500 border border-white/[0.06]"
                                          )}
                                        >
                                          #{p.placement} {p.riot_id} (+
                                          {p.points}đ)
                                        </span>
                                      ))}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ) : (
                      <div className="glass-card p-10 text-center text-zinc-500 text-xs font-mono">
                        Chưa có kết quả trận đấu nào.
                      </div>
                    )}
                  </div>
                </TabsContent>

                {/* TAB: AWARD DIAMONDS */}
                <TabsContent value="award" className="mt-4">
                  {selectedTournament && (
                    <AwardDiamonds
                      tournamentId={selectedTournamentId}
                      tournamentName={selectedTournament.name}
                      standings={tournamentStandings}
                    />
                  )}
                </TabsContent>

                {/* TAB: SHOP MANAGEMENT */}
                <TabsContent value="shop" className="mt-4">
                  <div className="flex flex-col gap-6">
                    <div className="glass-card p-5">
                      <h4 className="text-sm font-mono font-bold text-cyan-400 uppercase mb-4 flex items-center gap-2">
                        <Plus className="w-4 h-4" />
                        Tạo Vật Phẩm Mới
                      </h4>
                      <form
                        onSubmit={handleCreateShopItem}
                        className="flex flex-col gap-3"
                      >
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div className="flex flex-col gap-1">
                            <label className="text-[10px] text-zinc-500 font-mono uppercase font-bold">
                              Tên vật phẩm
                            </label>
                            <input
                              type="text"
                              value={newItemName}
                              onChange={(e) => setNewItemName(e.target.value)}
                              placeholder="Tên..."
                              required
                              className="bg-white/[0.03] border border-white/[0.08] rounded-lg px-3 py-2 text-sm font-mono text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-violet-500/50"
                            />
                          </div>
                          <div className="flex flex-col gap-1">
                            <label className="text-[10px] text-zinc-500 font-mono uppercase font-bold">
                              Giá (kim cương)
                            </label>
                            <input
                              type="number"
                              value={newItemPrice}
                              onChange={(e) =>
                                setNewItemPrice(
                                  Math.max(1, Number(e.target.value))
                                )
                              }
                              min={1}
                              className="bg-white/[0.03] border border-white/[0.08] rounded-lg px-3 py-2 text-sm font-mono text-zinc-200 focus:outline-none focus:border-violet-500/50"
                            />
                          </div>
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] text-zinc-500 font-mono uppercase font-bold">
                            Mô tả
                          </label>
                          <input
                            type="text"
                            value={newItemDesc}
                            onChange={(e) => setNewItemDesc(e.target.value)}
                            placeholder="Mô tả..."
                            className="bg-white/[0.03] border border-white/[0.08] rounded-lg px-3 py-2 text-sm font-mono text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-violet-500/50"
                          />
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] text-zinc-500 font-mono uppercase font-bold">
                            Loại
                          </label>
                          <select
                            value={newItemType}
                            onChange={(e) => setNewItemType(e.target.value)}
                            className="bg-white/[0.03] border border-white/[0.08] rounded-lg px-3 py-2 text-sm font-mono text-zinc-200 focus:outline-none focus:border-violet-500/50 cursor-pointer"
                          >
                            <option value="badge">🏅 Huy Hiệu</option>
                            <option value="discord_role">
                              🎭 Discord Role
                            </option>
                            <option value="custom_title">✨ Danh Hiệu</option>
                          </select>
                        </div>
                        <button
                          type="submit"
                          disabled={isCreatingItem || !newItemName.trim()}
                          className="w-full py-2 bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 text-white font-semibold rounded-lg transition-all cursor-pointer disabled:opacity-50 text-sm"
                        >
                          {isCreatingItem ? "Đang tạo..." : "Tạo Vật Phẩm"}
                        </button>
                      </form>
                    </div>

                    <div className="glass-card overflow-hidden">
                      <div className="p-4 border-b border-white/[0.06]">
                        <h4 className="text-sm font-mono font-bold text-zinc-200 flex items-center gap-2">
                          <ShoppingBag className="w-4 h-4 text-cyan-400" />
                          Vật Phẩm Trong Shop ({shopItems.length})
                        </h4>
                      </div>
                      {shopItems.length > 0 ? (
                        <div className="divide-y divide-white/[0.03]">
                          {shopItems.map((item) => (
                            <div
                              key={item.id}
                              className="p-4 flex items-center justify-between hover:bg-white/[0.02] transition-colors"
                            >
                              <div className="flex flex-col gap-1">
                                <div className="flex items-center gap-2">
                                  <span className="text-lg">
                                    {item.item_type === "discord_role"
                                      ? "🎭"
                                      : item.item_type === "badge"
                                      ? "🏅"
                                      : "✨"}
                                  </span>
                                  <span className="font-mono font-bold text-sm text-zinc-200">
                                    {item.name}
                                  </span>
                                  <span
                                    className={cn(
                                      "text-[9px] font-mono px-1.5 py-0.5 rounded font-bold",
                                      item.active
                                        ? "bg-green-500/10 text-green-400"
                                        : "bg-zinc-500/10 text-zinc-500"
                                    )}
                                  >
                                    {item.active ? "ACTIVE" : "INACTIVE"}
                                  </span>
                                </div>
                                {item.description && (
                                  <span className="text-xs text-zinc-500 font-mono">
                                    {item.description}
                                  </span>
                                )}
                                <span className="text-[10px] text-zinc-600 font-mono">
                                  {item.stock !== null
                                    ? `Còn: ${item.stock}`
                                    : "Không giới hạn"}
                                </span>
                              </div>
                              <span className="text-sm font-mono font-bold text-cyan-400 flex items-center gap-1">
                                <Gem className="w-3.5 h-3.5" />
                                {item.price}
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="p-8 text-center text-zinc-500 text-xs font-mono">
                          Chưa có vật phẩm.
                        </div>
                      )}
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </>
          ) : (
            <div className="glass-card p-12 text-center text-zinc-500 text-xs font-mono flex flex-col items-center gap-3">
              <Gamepad2 className="w-8 h-8 text-zinc-600" />
              ← Chọn hoặc tạo một giải đấu ở bảng bên trái để bắt đầu.
            </div>
          )}
        </div>
      </section>

      {/* ===== COMPS SECTION (always visible) ===== */}
      <section className="flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <Crown className="w-4 h-4 text-violet-400" />
          <h2 className="text-sm font-mono font-bold text-violet-400 uppercase tracking-widest">Quản Lý Đội Hình Hot TFT</h2>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Column 1: Form */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            <div className="glass-card p-5">
              <h4 className="text-sm font-mono font-bold text-violet-400 uppercase mb-4 flex items-center gap-2">
                <Crown className="w-4 h-4" />
                {editingCompId ? "Chỉnh sửa đội hình" : "Tạo Đội Hình Mới"}
              </h4>
              <form onSubmit={handleCreateOrUpdateComp} className="flex flex-col gap-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] text-zinc-500 font-mono uppercase font-bold">Tên đội hình</label>
                    <input
                      type="text"
                      value={compName}
                      onChange={(e) => setCompName(e.target.value)}
                      placeholder="Diệu Thủ Annie..."
                      required
                      className="bg-white/[0.03] border border-white/[0.08] rounded-lg px-3 py-2 text-sm font-mono text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-violet-500/50"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] text-zinc-500 font-mono uppercase font-bold">Tier</label>
                    <select
                      value={compTier}
                      onChange={(e) => setCompTier(e.target.value)}
                      className="bg-white/[0.03] border border-white/[0.08] rounded-lg px-3 py-2 text-sm font-mono text-zinc-200 focus:outline-none focus:border-violet-500/50 cursor-pointer"
                    >
                      <option value="S">🔥 Tier S</option>
                      <option value="A">⭐ Tier A</option>
                      <option value="B">⚡ Tier B</option>
                      <option value="C">❄️ Tier C</option>
                    </select>
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] text-zinc-500 font-mono uppercase font-bold">Mô tả lối chơi</label>
                  <textarea
                    value={compDescription}
                    onChange={(e) => setCompDescription(e.target.value)}
                    placeholder="Slowroll Annie 3 sao ở cấp 5..."
                    rows={2}
                    className="bg-white/[0.03] border border-white/[0.08] rounded-lg px-3 py-2 text-sm font-mono text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-violet-500/50"
                  />
                </div>

                {/* Image upload */}
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] text-zinc-500 font-mono uppercase font-bold">Ảnh Cover (Upload)</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="comp-image-upload"
                      disabled={uploadingImage}
                    />
                    <label
                      htmlFor="comp-image-upload"
                      className="px-4 py-2 bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.08] rounded-lg text-xs font-mono font-bold text-zinc-300 transition-colors cursor-pointer flex items-center gap-2"
                    >
                      {uploadingImage ? "Đang tải lên..." : "Chọn ảnh từ máy..."}
                    </label>
                    {compCoverImageUrl && (
                      <span className="text-[10px] text-green-400 font-mono line-clamp-1 flex-1">
                        ✅ Đã có ảnh cover
                      </span>
                    )}
                  </div>
                  {compCoverImageUrl && (
                    <div className="mt-2 border border-white/[0.08] rounded-lg overflow-hidden max-h-[120px]">
                      <img src={compCoverImageUrl} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>

                {/* Carry option dropdown */}
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] text-zinc-500 font-mono uppercase font-bold">Tướng Carry chính</label>
                  <select
                    value={compCarryApiName}
                    onChange={(e) => setCompCarryApiName(e.target.value)}
                    className="bg-white/[0.03] border border-white/[0.08] rounded-lg px-3 py-2 text-sm font-mono text-zinc-200 focus:outline-none focus:border-violet-500/50 cursor-pointer"
                  >
                    <option value="">-- Chọn tướng carry chính --</option>
                    {tftData.champions.map((c: any) => (
                      <option key={c.apiName} value={c.apiName}>{c.name}</option>
                    ))}
                  </select>
                </div>

                {/* 7x4 TFT Hexagonal Grid Editor */}
                <div className="flex flex-col gap-3 border-t border-white/[0.06] pt-4">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] text-zinc-400 font-mono uppercase font-bold">
                      Bàn cờ xếp tướng (TFT Board 7x4)
                    </label>
                    {selectedSlot !== null && (
                      <button
                        type="button"
                        onClick={() => setSelectedSlot(null)}
                        className="text-[9px] font-mono text-zinc-500 hover:text-zinc-300 cursor-pointer"
                      >
                        Bỏ chọn ô
                      </button>
                    )}
                  </div>

                  {/* Render the 7x4 hex grid */}
                  <div className="flex flex-col gap-1.5 p-4 bg-black/40 rounded-xl border border-white/[0.04] overflow-x-auto relative select-none">
                    {(() => {
                      // Map positions
                      const slots = Array(28).fill(null);
                      compUnits.forEach((u) => {
                        const pos = u.position !== undefined ? u.position : -1;
                        if (pos >= 0 && pos < 28) {
                          slots[pos] = u;
                        }
                      });

                      return [0, 1, 2, 3].map((rowIdx) => {
                        const isOdd = rowIdx % 2 !== 0;
                        return (
                          <div
                            key={rowIdx}
                            className={cn(
                              "flex justify-center gap-2",
                              isOdd ? "translate-x-[36px]" : ""
                            )}
                            style={{ marginTop: rowIdx > 0 ? "-15px" : "0px" }}
                          >
                            {[0, 1, 2, 3, 4, 5, 6].map((colIdx) => {
                              const slotIdx = rowIdx * 7 + colIdx;
                              const unit = slots[slotIdx];
                              const champ = unit ? tftData.champions.find((c: any) => c.apiName === unit.apiName) : null;
                              const isSlotSelected = selectedSlot === slotIdx;

                              const costColors: Record<number, string> = {
                                1: "border-zinc-500",
                                2: "border-emerald-500",
                                3: "border-blue-500",
                                4: "border-purple-500",
                                5: "border-amber-500",
                              };
                              const costBorder = champ ? costColors[champ.cost] || "border-zinc-500" : "border-zinc-800/40";

                              return (
                                <button
                                  key={colIdx}
                                  type="button"
                                  onClick={() => setSelectedSlot(slotIdx)}
                                  className="relative flex flex-col items-center focus:outline-none cursor-pointer"
                                  style={{ width: "66px", height: "72px" }}
                                >
                                  <div
                                    className={cn(
                                      "w-[66px] h-[72px] flex items-center justify-center transition-all duration-200 relative",
                                      isSlotSelected
                                        ? "scale-105"
                                        : unit
                                        ? "scale-95 hover:scale-100"
                                        : "scale-90 hover:scale-95"
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
                                          <div className="w-full h-full bg-zinc-800 flex items-center justify-center text-[9px] text-zinc-400">
                                            {unit.name}
                                          </div>
                                        )}

                                        {/* Border outline */}
                                        <div
                                          className={cn(
                                            "absolute inset-0 border-2 pointer-events-none",
                                            isSlotSelected
                                              ? "border-violet-500 shadow-[inset_0_0_8px_rgba(139,92,246,0.8)]"
                                              : unit.isCarry
                                              ? "border-amber-400 shadow-[inset_0_0_8px_rgba(245,158,11,0.5)]"
                                              : unit.isFlex
                                              ? "border-emerald-400 shadow-[inset_0_0_8px_rgba(34,197,94,0.5)]"
                                              : costBorder
                                          )}
                                          style={{
                                            clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)",
                                          }}
                                        />

                                        {/* Champion Name Gradient Overlay */}
                                        <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent pt-3 pb-1 flex flex-col items-center justify-end">
                                          <span className="text-[8px] font-bold text-white font-sans text-center leading-none px-0.5 truncate max-w-[58px]">
                                            {champ.name || unit.name}
                                          </span>
                                        </div>
                                      </>
                                    ) : (
                                      // Empty slot
                                      <div
                                        className={cn(
                                          "w-full h-full border transition-all",
                                          isSlotSelected
                                            ? "bg-violet-500/10 border-violet-500"
                                            : "bg-[#141420]/30 border-white/[0.04] hover:bg-white/[0.02] hover:border-white/[0.08]"
                                        )}
                                        style={{
                                          clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)",
                                        }}
                                      />
                                    )}
                                  </div>

                                  {/* Items display overlay on grid */}
                                  {unit && unit.items && unit.items.length > 0 && (
                                    <div className="absolute -bottom-1 z-25 flex gap-0.5 scale-75 bg-black/60 px-1 py-0.5 rounded-full border border-white/10">
                                      {unit.items.slice(0, 3).map((itemApi: string, idx: number) => {
                                        const item = tftData.items.find((i: any) => i.apiName === itemApi) || { name: itemApi, image: "" };
                                        return (
                                          <img
                                            key={idx}
                                            src={item.image || "/api/placeholder/16/16"}
                                            alt={item.name || ""}
                                            className="w-[14px] h-[14px] object-cover rounded border border-white/25"
                                          />
                                        );
                                      })}
                                    </div>
                                  )}
                                </button>
                              );
                            })}
                          </div>
                        );
                      });
                    })()}
                  </div>
                </div>

                {/* Sub-panel depending on selectedSlot */}
                {selectedSlot !== null && (() => {
                  const slots = Array(28).fill(null);
                  compUnits.forEach((u) => {
                    const pos = u.position !== undefined ? u.position : -1;
                    if (pos >= 0 && pos < 28) {
                      slots[pos] = u;
                    }
                  });
                  const unit = slots[selectedSlot];
                  const uIdx = compUnits.findIndex(u => u.position === selectedSlot);

                  if (unit) {
                    // UNIT SETTINGS
                    const champData = tftData.champions.find((c: any) => c.apiName === unit.apiName);
                    return (
                      <div className="flex flex-col gap-3 bg-white/[0.02] border border-white/[0.06] rounded-xl p-4 animate-fadeIn">
                        <div className="flex items-center justify-between border-b border-white/[0.04] pb-2">
                          <div className="flex items-center gap-2">
                            {champData?.image && (
                              <img src={champData.image} alt={unit.name} className="w-6 h-6 object-cover rounded" />
                            )}
                            <span className="text-xs font-bold font-mono text-zinc-200">
                              Ô {selectedSlot + 1}: {unit.name}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setCompUnits(compUnits.filter((_, idx) => idx !== uIdx));
                              setSelectedSlot(null);
                            }}
                            className="px-2 py-1 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 rounded text-[9px] font-mono font-bold text-rose-400 transition-colors cursor-pointer"
                          >
                            Gỡ Tướng 🗑️
                          </button>
                        </div>

                        <div className="flex items-center gap-4">
                          <label className="flex items-center gap-1.5 text-[11px] text-zinc-300 font-mono cursor-pointer">
                            <input
                              type="checkbox"
                              checked={unit.isCarry}
                              onChange={(e) => {
                                const updated = [...compUnits];
                                updated[uIdx].isCarry = e.target.checked;
                                setCompUnits(updated);
                              }}
                              className="rounded border-zinc-700 bg-zinc-800 text-violet-500 focus:ring-violet-500"
                            />
                            👑 Carry chính
                          </label>
                          <label className="flex items-center gap-1.5 text-[11px] text-zinc-300 font-mono cursor-pointer">
                            <input
                              type="checkbox"
                              checked={unit.isFlex}
                              onChange={(e) => {
                                const updated = [...compUnits];
                                updated[uIdx].isFlex = e.target.checked;
                                setCompUnits(updated);
                              }}
                              className="rounded border-zinc-700 bg-zinc-800 text-violet-500 focus:ring-violet-500"
                            />
                            🔄 Flex / Tùy biến
                          </label>
                        </div>

                        {/* Item selects */}
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[10px] text-zinc-500 font-mono uppercase font-bold">Trang bị khuyên dùng (Max 3)</label>
                          <div className="grid grid-cols-3 gap-2">
                            {[0, 1, 2].map((slotIdx) => (
                              <select
                                key={slotIdx}
                                value={unit.items[slotIdx] || ""}
                                onChange={(e) => {
                                  const updated = [...compUnits];
                                  const items = [...(unit.items || [])];
                                  if (e.target.value) {
                                    items[slotIdx] = e.target.value;
                                  } else {
                                    items.splice(slotIdx, 1);
                                  }
                                  updated[uIdx].items = items.filter(Boolean);
                                  setCompUnits(updated);
                                }}
                                className="bg-white/[0.03] border border-white/[0.08] rounded px-2 py-1.5 text-[10px] font-mono text-zinc-300 focus:outline-none focus:border-violet-500/50 cursor-pointer"
                              >
                                <option value="">Trang bị {slotIdx + 1}</option>
                                {tftData.items.map((item: any) => (
                                  <option key={item.apiName} value={item.apiName}>{item.name}</option>
                                ))}
                              </select>
                            ))}
                          </div>
                        </div>
                      </div>
                    );
                  } else {
                    // CHAMP SELECT PANEL
                    const filteredChamps = tftData.champions.filter((c: any) =>
                      c.name.toLowerCase().includes(champSearch.toLowerCase())
                    );

                    return (
                      <div className="flex flex-col gap-3 bg-white/[0.02] border border-white/[0.06] rounded-xl p-4 animate-fadeIn">
                        <div className="flex items-center justify-between border-b border-white/[0.04] pb-2">
                          <span className="text-xs font-bold font-mono text-violet-400">
                            Đặt tướng vào Ô {selectedSlot + 1}
                          </span>
                          <div className="flex items-center gap-1.5 bg-black/20 border border-white/[0.04] rounded px-2 py-1">
                            <Search className="w-3 h-3 text-zinc-500" />
                            <input
                              type="text"
                              value={champSearch}
                              onChange={(e) => setChampSearch(e.target.value)}
                              placeholder="Tìm tướng..."
                              className="bg-transparent text-[10px] font-mono text-zinc-300 focus:outline-none w-[100px]"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-5 sm:grid-cols-7 gap-2 max-h-[160px] overflow-y-auto p-1 bg-black/20 rounded border border-white/[0.04]">
                          {filteredChamps.map((c: any) => {
                            // Check if this champ is already placed somewhere else
                            const isPlaced = compUnits.some(u => u.apiName === c.apiName);
                            return (
                              <button
                                key={c.apiName}
                                type="button"
                                onClick={() => {
                                  // Add new unit to selectedSlot
                                  const newUnit = {
                                    apiName: c.apiName,
                                    name: c.name,
                                    isCarry: false,
                                    isFlex: false,
                                    items: [],
                                    position: selectedSlot,
                                  };
                                  setCompUnits([...compUnits, newUnit]);
                                }}
                                title={c.name}
                                className={cn(
                                  "relative flex items-center justify-center p-1 rounded border transition-all hover:scale-105 aspect-square cursor-pointer",
                                  isPlaced
                                    ? "border-amber-500/50 bg-amber-500/5 grayscale-[50%]"
                                    : "border-white/[0.06] bg-white/[0.01] hover:border-violet-500/50 hover:bg-violet-500/5"
                                )}
                              >
                                {c.image ? (
                                  <img src={c.image} alt={c.name} className="w-full h-full object-cover rounded" />
                                ) : (
                                  <span className="text-[8px] line-clamp-1">{c.name}</span>
                                )}
                                {isPlaced && (
                                  <span className="absolute top-0 right-0 bg-amber-500 text-black text-[6px] font-extrabold px-0.5 rounded-bl">
                                    IN USE
                                  </span>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  }
                })()}

                {/* Traits management */}
                <div className="flex flex-col gap-1 border-t border-white/[0.06] pt-3">
                  <label className="text-[10px] text-zinc-400 font-mono uppercase font-bold">Kích Hoạt Tộc / Hệ</label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {compTraits.map((trait, tIdx) => (
                      <div key={trait.apiName} className="flex items-center gap-1 px-2 py-1 bg-violet-500/10 border border-violet-500/20 text-violet-400 font-mono text-[10px] font-bold rounded">
                        <span>{trait.name} ({trait.count})</span>
                        <button
                          type="button"
                          onClick={() => setCompTraits(compTraits.filter(t => t.apiName !== trait.apiName))}
                          className="hover:text-rose-400 cursor-pointer ml-1"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <select
                      onChange={(e) => {
                        if (!e.target.value) return;
                        const selectedTrait = tftData.traits.find((t: any) => t.apiName === e.target.value);
                        if (selectedTrait && !compTraits.some(t => t.apiName === e.target.value)) {
                          setCompTraits([...compTraits, { apiName: selectedTrait.apiName, name: selectedTrait.name, count: 2 }]);
                        }
                        e.target.value = "";
                      }}
                      className="bg-white/[0.03] border border-white/[0.08] rounded-lg p-2 text-xs font-mono text-zinc-300 cursor-pointer"
                    >
                      <option value="">+ Thêm tộc/hệ...</option>
                      {tftData.traits.map((t: any) => (
                        <option key={t.apiName} value={t.apiName}>{t.name}</option>
                      ))}
                    </select>
                    {compTraits.length > 0 && (
                      <div className="flex flex-col gap-1 max-h-[120px] overflow-y-auto">
                        {compTraits.map((t, idx) => (
                          <div key={t.apiName} className="flex items-center justify-between gap-2 p-1 bg-black/10 rounded">
                            <span className="text-[10px] font-mono text-zinc-400">{t.name}</span>
                            <input
                              type="number"
                              value={t.count}
                              onChange={(e) => {
                                const updated = [...compTraits];
                                updated[idx].count = Math.max(1, Number(e.target.value));
                                setCompTraits(updated);
                              }}
                              className="w-12 bg-white/[0.03] border border-white/[0.08] rounded p-0.5 text-center text-[10px] font-mono text-zinc-200"
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Augments management */}
                <div className="flex flex-col gap-1 border-t border-white/[0.06] pt-3">
                  <label className="text-[10px] text-zinc-400 font-mono uppercase font-bold">Lõi Công Nghệ Khuyên Dùng (Ưu Tiên)</label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {compAugments.map((a, aIdx) => (
                      <div key={aIdx} className="flex items-center gap-1 px-2 py-1 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 font-mono text-[10px] font-bold rounded">
                        <span>{a.name}</span>
                        <button
                          type="button"
                          onClick={() => setCompAugments(compAugments.filter((_, i) => i !== aIdx))}
                          className="hover:text-rose-400 cursor-pointer ml-1"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                  <input
                    type="text"
                    placeholder="Nhập tên lõi và ấn Enter..."
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        const val = e.currentTarget.value.trim();
                        if (val) {
                          setCompAugments([...compAugments, { name: val }]);
                          e.currentTarget.value = "";
                        }
                      }
                    }}
                    className="bg-white/[0.03] border border-white/[0.08] rounded-lg px-3 py-2 text-xs font-mono text-zinc-200 placeholder:text-zinc-600 focus:outline-none"
                  />
                </div>

                {/* Early units */}
                <div className="flex flex-col gap-1 border-t border-white/[0.06] pt-3">
                  <label className="text-[10px] text-zinc-400 font-mono uppercase font-bold">Đội Hình Đầu Trận</label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {compEarlyUnits.map((u, uIdx) => (
                      <div key={uIdx} className="flex items-center gap-1 px-2 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-400 font-mono text-[10px] font-bold rounded">
                        <span>{u.name}</span>
                        <button
                          type="button"
                          onClick={() => setCompEarlyUnits(compEarlyUnits.filter((_, i) => i !== uIdx))}
                          className="hover:text-rose-400 cursor-pointer ml-1"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                  <select
                    onChange={(e) => {
                      if (!e.target.value) return;
                      const champData = tftData.champions.find((c: any) => c.apiName === e.target.value);
                      if (champData && !compEarlyUnits.some(u => u.apiName === e.target.value)) {
                        setCompEarlyUnits([...compEarlyUnits, { apiName: champData.apiName, name: champData.name }]);
                      }
                      e.target.value = "";
                    }}
                    className="bg-white/[0.03] border border-white/[0.08] rounded-lg p-2 text-xs font-mono text-zinc-300 cursor-pointer"
                  >
                    <option value="">+ Thêm tướng đầu trận...</option>
                    {tftData.champions.map((c: any) => (
                      <option key={c.apiName} value={c.apiName}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div className="flex gap-3 pt-4 border-t border-white/[0.06]">
                  <button
                    type="submit"
                    disabled={isSubmittingComp || !compName.trim()}
                    className="flex-1 py-2.5 bg-gradient-to-r from-violet-600 to-violet-500 hover:from-violet-500 hover:to-violet-400 text-white font-semibold rounded-lg transition-all cursor-pointer disabled:opacity-50 text-sm"
                  >
                    {isSubmittingComp ? "Đang xử lý..." : editingCompId ? "Cập Nhật Đội Hình" : "Tạo Đội Hình"}
                  </button>
                  {editingCompId && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingCompId(null);
                        setCompName("");
                        setCompDescription("");
                        setCompTier("A");
                        setCompCarryApiName("");
                        setCompCoverImageUrl("");
                        setCompUnits([]);
                        setCompTraits([]);
                        setCompAugments([]);
                        setCompEarlyUnits([]);
                      }}
                      className="px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-semibold rounded-lg transition-colors cursor-pointer text-sm"
                    >
                      Hủy
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>

          {/* Column 2: Listing */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            <div className="glass-card overflow-hidden">
              <div className="p-4 border-b border-white/[0.06]">
                <h4 className="text-sm font-mono font-bold text-zinc-200 flex items-center gap-2">
                  <Crown className="w-4 h-4 text-violet-400" />
                  Đội Hình Hot TFT ({comps.length})
                </h4>
              </div>
              {comps.length > 0 ? (
                <div className="divide-y divide-white/[0.03] max-h-[800px] overflow-y-auto">
                  {comps.map((c) => {
                    const carryInfo = tftData.champions.find((champ: any) => champ.apiName === c.carry_api_name);
                    return (
                      <div key={c.id} className="p-4 hover:bg-white/[0.02] transition-colors flex flex-col gap-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className={cn(
                              "text-[9px] font-mono px-2 py-0.5 rounded font-bold border",
                              c.tier === "S"
                                ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                                : c.tier === "A"
                                ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
                                : c.tier === "B"
                                ? "bg-zinc-300/10 text-zinc-300 border-zinc-300/20"
                                : "bg-zinc-500/10 text-zinc-500 border-zinc-500/20"
                            )}>
                              Tier {c.tier}
                            </span>
                            <span className="font-bold text-sm text-zinc-200 font-mono">{c.name}</span>
                          </div>
                          <span className={cn(
                            "text-[9px] font-mono px-1.5 py-0.5 rounded font-bold",
                            c.is_active ? "bg-green-500/10 text-green-400" : "bg-rose-500/10 text-rose-400"
                          )}>
                            {c.is_active ? "ACTIVE" : "HIDDEN"}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-xs font-mono text-zinc-500">
                          {carryInfo?.image && (
                            <img src={carryInfo.image} alt={carryInfo.name} className="w-4 h-4 object-cover rounded" />
                          )}
                          <span>Carry: {carryInfo?.name || c.carry_api_name || "N/A"}</span>
                        </div>

                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditCompClick(c)}
                            className="px-2 py-1 bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.08] rounded text-[10px] font-mono font-bold text-zinc-300 transition-colors cursor-pointer"
                          >
                            Sửa
                          </button>
                          <button
                            onClick={() => handleToggleCompActive(c.id, c.is_active)}
                            className={cn(
                              "px-2 py-1 border rounded text-[10px] font-mono font-bold transition-colors cursor-pointer",
                              c.is_active
                                ? "bg-rose-500/10 text-rose-400 border-rose-500/20 hover:bg-rose-500/20"
                                : "bg-green-500/10 text-green-400 border-green-500/20 hover:bg-green-500/20"
                            )}
                          >
                            {c.is_active ? "Ẩn" : "Hiện"}
                          </button>
                          <button
                            onClick={() => handleDeleteComp(c.id, c.name)}
                            className="px-2 py-1 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 rounded text-[10px] font-mono font-bold text-rose-400 transition-colors cursor-pointer"
                          >
                            Xóa
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-8 text-center text-zinc-500 text-xs font-mono">
                  Chưa có đội hình nào.
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}