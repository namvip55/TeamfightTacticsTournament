"use server";

import { revalidatePath } from "next/cache";
import { supabase } from "./supabase";
import { loginAdmin, logoutAdmin } from "./auth";

const POINTS_BY_PLACEMENT: Record<number, number> = {
  1: 8,
  2: 7,
  3: 6,
  4: 5,
  5: 4,
  6: 3,
  7: 2,
  8: 1,
};

// ----------------------------------------------------
// Admin Passcode Authentication Actions
// ----------------------------------------------------
export async function loginAdminAction(passcode: string) {
  try {
    const success = await loginAdmin(passcode);
    if (success) {
      revalidatePath("/admin");
      return { success: true };
    }
    return { success: false, error: "Mật khẩu quản trị viên không chính xác!" };
  } catch (error: any) {
    console.error("Login action error:", error);
    return { success: false, error: error.message || "Failed to login" };
  }
}

export async function logoutAdminAction() {
  try {
    await logoutAdmin();
    revalidatePath("/admin");
    return { success: true };
  } catch (error: any) {
    console.error("Logout action error:", error);
    return { success: false, error: error.message || "Failed to logout" };
  }
}

// ----------------------------------------------------
// Standings Engine (Recalculate from all lobby scores)
// ----------------------------------------------------
export async function recalculateStandingsAction(tournamentId: string) {
  try {
    // 1. Fetch all lobby players for this tournament with placements
    const { data: lobbyPlayers, error: fetchError } = await supabase
      .from("lobby_players")
      .select("*")
      .eq("tournament_id", tournamentId)
      .not("placement", "is", null);

    if (fetchError) throw fetchError;

    // 2. Clear old standings for this tournament to ensure clean slate
    const { error: deleteError } = await supabase
      .from("standings")
      .delete()
      .eq("tournament_id", tournamentId);

    if (deleteError) throw deleteError;

    if (!lobbyPlayers || lobbyPlayers.length === 0) {
      return { success: true, message: "No scores to calculate. Standings cleared." };
    }

    // 3. Group and aggregate scores by player
    const playerStats: Record<string, {
      player_id: string;
      discord_id: string;
      riot_id: string;
      puuid: string;
      total_points: number;
      games_played: number;
      total_wins: number;
      total_top4: number;
      total_placement: number;
    }> = {};

    for (const lp of lobbyPlayers) {
      const pId = lp.player_id;
      const placement = lp.placement as number;
      const points = lp.points || 0;

      if (!playerStats[pId]) {
        playerStats[pId] = {
          player_id: pId,
          discord_id: lp.discord_id,
          riot_id: lp.riot_id,
          puuid: lp.puuid,
          total_points: 0,
          games_played: 0,
          total_wins: 0,
          total_top4: 0,
          total_placement: 0,
        };
      }

      const stats = playerStats[pId];
      stats.total_points += points;
      stats.games_played += 1;
      stats.total_placement += placement;
      if (placement === 1) stats.total_wins += 1;
      if (placement <= 4) stats.total_top4 += 1;
    }

    // 4. Insert calculated standings
    const standingsToInsert = Object.values(playerStats).map((stats) => ({
      tournament_id: tournamentId,
      player_id: stats.player_id,
      discord_id: stats.discord_id,
      riot_id: stats.riot_id,
      puuid: stats.puuid,
      total_points: stats.total_points,
      games_played: stats.games_played,
      total_wins: stats.total_wins,
      total_top4: stats.total_top4,
      total_placement: stats.total_placement,
      avg_placement: stats.total_placement / stats.games_played,
      updated_at: new Date().toISOString(),
    }));

    const { error: insertError } = await supabase
      .from("standings")
      .insert(standingsToInsert);

    if (insertError) throw insertError;

    revalidatePath(`/tournaments/${tournamentId}`);
    return { success: true, message: "Standings recalculated successfully!" };
  } catch (error: any) {
    console.error("Error recalculating standings:", error);
    return { success: false, error: error.message || "Failed to recalculate standings" };
  }
}

// ----------------------------------------------------
// Create Tournament
// ----------------------------------------------------
export async function createTournamentAction(name: string) {
  try {
    if (!name || name.trim() === "") {
      throw new Error("Tournament name cannot be empty");
    }

    const { data: tournament, error: tournamentError } = await supabase
      .from("tournaments")
      .insert({
        name: name.trim(),
        status: "registration_open",
        registration_open: true,
        locked: false,
      })
      .select()
      .single();

    if (tournamentError) throw tournamentError;

    const { data: lobby, error: lobbyError } = await supabase
      .from("lobbies")
      .insert({
        tournament_id: tournament.id,
        name: "Lobby 1",
        status: "open",
      })
      .select()
      .single();

    if (lobbyError) throw lobbyError;

    revalidatePath("/");
    revalidatePath("/admin");
    return { success: true, tournament, lobby };
  } catch (error: any) {
    console.error("Error creating tournament:", error);
    return { success: false, error: error.message };
  }
}

// ----------------------------------------------------
// Toggle Registration
// ----------------------------------------------------
export async function toggleRegistrationAction(tournamentId: string, open: boolean) {
  try {
    const status = open ? "registration_open" : "registration_closed";
    const { error } = await supabase
      .from("tournaments")
      .update({
        status,
        registration_open: open,
        locked: !open,
      })
      .eq("id", tournamentId);

    if (error) throw error;

    revalidatePath(`/tournaments/${tournamentId}`);
    revalidatePath("/admin");
    return { success: true };
  } catch (error: any) {
    console.error("Error toggling registration:", error);
    return { success: false, error: error.message };
  }
}

// ----------------------------------------------------
// Delete Tournament
// ----------------------------------------------------
export async function deleteTournamentAction(id: string) {
  try {
    const { error } = await supabase.from("tournaments").delete().eq("id", id);
    if (error) throw error;

    revalidatePath("/");
    revalidatePath("/admin");
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting tournament:", error);
    return { success: false, error: error.message };
  }
}

// ----------------------------------------------------
// Manual Placement Scoring
// ----------------------------------------------------
export async function manualScoreLobbyAction(
  tournamentId: string,
  lobbyId: string,
  placements: Record<string, number> // player_id -> placement (1 to 8)
) {
  try {
    // placements check: must be exactly 8 entries containing digits 1 to 8 uniquely
    const vals = Object.values(placements);
    if (vals.length !== 8) {
      throw new Error("Phải nhập đầy đủ thứ hạng cho cả 8 tuyển thủ trong Lobby");
    }
    const uniqueVals = new Set(vals);
    if (uniqueVals.size !== 8 || Math.min(...vals) < 1 || Math.max(...vals) > 8) {
      throw new Error("Thứ hạng phải là các số từ 1 đến 8 và không trùng lặp");
    }

    const matchId = `MANUAL_${Date.now()}`;

    // Get lobby players
    const { data: lobbyPlayers, error: fetchError } = await supabase
      .from("lobby_players")
      .select("*")
      .eq("lobby_id", lobbyId);

    if (fetchError) throw fetchError;
    if (!lobbyPlayers || lobbyPlayers.length !== 8) {
      throw new Error("Lobby phải có đủ 8 người chơi đăng ký mới có thể tính điểm!");
    }

    // Update each lobby player placement and points
    for (const lp of lobbyPlayers) {
      const placement = placements[lp.player_id];
      if (placement === undefined) {
        throw new Error(`Thiếu thứ hạng cho người chơi ${lp.riot_id}`);
      }

      const points = POINTS_BY_PLACEMENT[placement] || 0;

      const { error: updateError } = await supabase
        .from("lobby_players")
        .update({
          placement,
          points,
          match_id: matchId,
          verified: true,
          updated_at: new Date().toISOString(),
        })
        .eq("id", lp.id);

      if (updateError) throw updateError;
    }

    // Recalculate standings
    await recalculateStandingsAction(tournamentId);

    revalidatePath(`/tournaments/${tournamentId}`);
    return { success: true, message: "Đã lưu kết quả và cập nhật BXH thành công!" };
  } catch (error: any) {
    console.error("Error scoring lobby manually:", error);
    return { success: false, error: error.message };
  }
}

// ----------------------------------------------------
// Seed Mock Data
// ----------------------------------------------------
export async function seedMockDataAction() {
  try {
    // 1. Create a mock tournament
    const tournamentName = `TFT Đấu Trường Chân Lý - Mùa 13 (Mẫu)`;
    
    // Check if there is already a mock tournament to prevent overloading
    const { data: existingTournaments } = await supabase
      .from("tournaments")
      .select("*")
      .eq("name", tournamentName);
      
    if (existingTournaments && existingTournaments.length > 0) {
      // Delete old mock tournaments to seed fresh
      for (const t of existingTournaments) {
        await supabase.from("tournaments").delete().eq("id", t.id);
      }
    }

    const { data: tournament, error: tErr } = await supabase
      .from("tournaments")
      .insert({
        name: tournamentName,
        status: "registration_closed",
        registration_open: false,
        locked: true,
      })
      .select()
      .single();

    if (tErr) throw tErr;

    // 2. Create the Lobby 1
    const { data: lobby, error: lErr } = await supabase
      .from("lobbies")
      .insert({
        tournament_id: tournament.id,
        name: "Lobby 1",
        status: "open",
      })
      .select()
      .single();

    if (lErr) throw lErr;

    // 3. Create 8 mock players in players table (upsert based on discord_id)
    const mockPlayers = [
      { discord_id: "discord_seed_1", discord_username: "cuongtft", riot_id: "Cường TFT#VN1", game_name: "Cường TFT", tag_line: "VN1", puuid: "puuid_seed_1" },
      { discord_id: "discord_seed_2", discord_username: "huycothu", riot_id: "Huy Cờ Thủ#VN2", game_name: "Huy Cờ Thủ", tag_line: "VN2", puuid: "puuid_seed_2" },
      { discord_id: "discord_seed_3", discord_username: "hoangchess", riot_id: "Hoàng Chess#NA1", game_name: "Hoàng Chess", tag_line: "NA1", puuid: "puuid_seed_3" },
      { discord_id: "discord_seed_4", discord_username: "linhdocco", riot_id: "Linh Độc Cô#VN3", game_name: "Linh Độc Cô", tag_line: "VN3", puuid: "puuid_seed_4" },
      { discord_id: "discord_seed_5", discord_username: "namflex", riot_id: "Nam Flex#VN4", game_name: "Nam Flex", tag_line: "VN4", puuid: "puuid_seed_5" },
      { discord_id: "discord_seed_6", discord_username: "vybatbai", riot_id: "Vy Bất Bại#VN5", game_name: "Vy Bất Bại", tag_line: "VN5", puuid: "puuid_seed_6" },
      { discord_id: "discord_seed_7", discord_username: "duongcaothu", riot_id: "Dương Cao Thủ#VN6", game_name: "Dương Cao Thủ", tag_line: "VN6", puuid: "puuid_seed_7" },
      { discord_id: "discord_seed_8", discord_username: "tuanlowroll", riot_id: "Tuấn Lowroll#VN7", game_name: "Tuấn Lowroll", tag_line: "VN7", puuid: "puuid_seed_8" },
    ];

    const insertedPlayers: any[] = [];
    for (const mp of mockPlayers) {
      const { data: player, error: pErr } = await supabase
        .from("players")
        .upsert(mp, { onConflict: "discord_id" })
        .select()
        .single();
      if (pErr) throw pErr;
      insertedPlayers.push(player);
    }

    // 4. Register mock players to lobby_players
    const lpInserts = insertedPlayers.map((player) => ({
      tournament_id: tournament.id,
      lobby_id: lobby.id,
      player_id: player.id,
      discord_id: player.discord_id,
      riot_id: player.riot_id,
      puuid: player.puuid,
    }));

    const { error: lpErr } = await supabase
      .from("lobby_players")
      .insert(lpInserts);

    if (lpErr) throw lpErr;

    // 5. Seed Placements for Game 1 (Cường 1st, Huy 2nd, Hoàng 3rd, Linh 4th, Nam 5th, Vy 6th, Dương 7th, Tuấn 8th)
    const placements = [1, 2, 3, 4, 5, 6, 7, 8];
    const matchId = `MANUAL_MOCK_GAME_1`;

    // Fetch the inserted lobby players
    const { data: lobbyPlayers, error: fetchLPErr } = await supabase
      .from("lobby_players")
      .select("*")
      .eq("lobby_id", lobby.id);

    if (fetchLPErr) throw fetchLPErr;

    for (let i = 0; i < lobbyPlayers.length; i++) {
      const lp = lobbyPlayers[i];
      const placement = placements[i];
      const points = POINTS_BY_PLACEMENT[placement];

      const { error: updateError } = await supabase
        .from("lobby_players")
        .update({
          placement,
          points,
          match_id: matchId,
          verified: true,
          updated_at: new Date().toISOString(),
        })
        .eq("id", lp.id);

      if (updateError) throw updateError;
    }

    // 6. Calculate standings
    await recalculateStandingsAction(tournament.id);

    revalidatePath("/");
    revalidatePath("/admin");
    return { success: true, message: "Đã khởi tạo dữ liệu giải đấu mẫu thành công!" };
  } catch (error: any) {
    console.error("Error seeding mock data:", error);
    return { success: false, error: error.message };
  }
}

// ----------------------------------------------------
// Create Tournament V2 (Multi-Lobby + Checkmate Mode)
// ----------------------------------------------------
export async function createTournamentV2Action(
  name: string,
  lobbyCount: number,
  mode: string = "normal",
  checkmateScore: number = 20
) {
  try {
    if (!name || name.trim() === "") {
      throw new Error("Tên giải đấu không được để trống");
    }
    if (lobbyCount < 1 || lobbyCount > 32) {
      throw new Error("Số lobby phải từ 1 đến 32");
    }
    if (mode === "checkmate" && checkmateScore < 1) {
      throw new Error("Mốc điểm checkmate phải lớn hơn 0");
    }

    const { data: tournament, error: tournamentError } = await supabase
      .from("tournaments")
      .insert({
        name: name.trim(),
        mode,
        checkmate_score: mode === "checkmate" ? checkmateScore : 0,
        status: "registration_open",
        registration_open: true,
        locked: false,
      })
      .select()
      .single();

    if (tournamentError) throw tournamentError;

    const lobbiesToInsert = [];
    for (let i = 1; i <= lobbyCount; i++) {
      lobbiesToInsert.push({
        tournament_id: tournament.id,
        name: `Lobby ${i}`,
        status: "open",
      });
    }

    const { data: lobbies, error: lobbyError } = await supabase
      .from("lobbies")
      .insert(lobbiesToInsert)
      .select();

    if (lobbyError) throw lobbyError;

    // Send Discord webhook notification
    const webhookEmbed = buildTournamentWebhookEmbed(tournament, lobbies, "created");
    await sendDiscordWebhook(webhookEmbed);

    revalidatePath("/");
    revalidatePath("/admin");
    return { success: true, tournament, lobbies };
  } catch (error: any) {
    console.error("Error creating tournament v2:", error);
    return { success: false, error: error.message };
  }
}

// ----------------------------------------------------
// Kick Player from Lobby
// ----------------------------------------------------
export async function kickPlayerAction(
  tournamentId: string,
  lobbyId: string,
  discordId: string
) {
  try {
    const { data, error } = await supabase
      .from("lobby_players")
      .delete()
      .eq("tournament_id", tournamentId)
      .eq("lobby_id", lobbyId)
      .eq("discord_id", discordId)
      .select();

    if (error) throw error;

    if (!data || data.length === 0) {
      throw new Error("Tuyển thủ không có trong lobby này");
    }

    await recalculateStandingsAction(tournamentId);

    revalidatePath(`/tournaments/${tournamentId}`);
    revalidatePath("/admin");
    return { success: true, message: `Đã kick tuyển thủ ${data[0].riot_id} khỏi lobby`, removed: data[0] };
  } catch (error: any) {
    console.error("Error kicking player:", error);
    return { success: false, error: error.message };
  }
}

// ----------------------------------------------------
// Move Player to Another Lobby
// ----------------------------------------------------
export async function movePlayerAction(
  tournamentId: string,
  discordId: string,
  targetLobbyId: string
) {
  try {
    // Check target lobby capacity
    const { data: targetPlayers, error: fetchError } = await supabase
      .from("lobby_players")
      .select("id")
      .eq("lobby_id", targetLobbyId);

    if (fetchError) throw fetchError;

    if (targetPlayers && targetPlayers.length >= 8) {
      throw new Error("Lobby đích đã đủ 8 người");
    }

    const { data, error } = await supabase
      .from("lobby_players")
      .update({
        lobby_id: targetLobbyId,
        updated_at: new Date().toISOString(),
      })
      .eq("tournament_id", tournamentId)
      .eq("discord_id", discordId)
      .select()
      .single();

    if (error) throw error;

    revalidatePath(`/tournaments/${tournamentId}`);
    revalidatePath("/admin");
    return { success: true, message: `Đã chuyển ${data.riot_id} sang lobby mới`, moved: data };
  } catch (error: any) {
    console.error("Error moving player:", error);
    return { success: false, error: error.message };
  }
}

// ----------------------------------------------------
// Undo Match Score
// ----------------------------------------------------
export async function undoMatchScoreAction(matchId: string) {
  try {
    // Check if match exists
    const { data: matchResult, error: selectError } = await supabase
      .from("match_results")
      .select("*")
      .eq("match_id", matchId)
      .maybeSingle();

    if (selectError) throw selectError;
    if (!matchResult) {
      throw new Error("Match ID này chưa từng được tính điểm");
    }

    const tournamentId = matchResult.tournament_id;

    // Delete match player results
    const { error: playerDeleteError } = await supabase
      .from("match_player_results")
      .delete()
      .eq("match_id", matchId);

    if (playerDeleteError) throw playerDeleteError;

    // Delete match result
    const { error: matchDeleteError } = await supabase
      .from("match_results")
      .delete()
      .eq("match_id", matchId);

    if (matchDeleteError) throw matchDeleteError;

    // Reset lobby players placements for this match
    const { error: resetError } = await supabase
      .from("lobby_players")
      .update({
        placement: null,
        points: 0,
        match_id: null,
        verified: false,
        updated_at: new Date().toISOString(),
      })
      .eq("match_id", matchId);

    if (resetError) throw resetError;

    // Recalculate standings
    await recalculateStandingsAction(tournamentId);

    revalidatePath(`/tournaments/${tournamentId}`);
    revalidatePath("/admin");
    return { success: true, message: `Đã undo kết quả match ${matchId} và cập nhật lại BXH` };
  } catch (error: any) {
    console.error("Error undoing match score:", error);
    return { success: false, error: error.message };
  }
}

// ----------------------------------------------------
// Add New Lobby to Tournament
// ----------------------------------------------------
export async function addLobbyAction(tournamentId: string) {
  try {
    // Count existing lobbies
    const { data: existingLobbies, error: countError } = await supabase
      .from("lobbies")
      .select("id")
      .eq("tournament_id", tournamentId);

    if (countError) throw countError;

    const nextNumber = (existingLobbies?.length || 0) + 1;

    const { data: lobby, error } = await supabase
      .from("lobbies")
      .insert({
        tournament_id: tournamentId,
        name: `Lobby ${nextNumber}`,
        status: "open",
      })
      .select()
      .single();

    if (error) throw error;

    revalidatePath(`/tournaments/${tournamentId}`);
    revalidatePath("/admin");
    return { success: true, message: `Đã tạo ${lobby.name}`, lobby };
  } catch (error: any) {
    console.error("Error adding lobby:", error);
    return { success: false, error: error.message };
  }
}

// ----------------------------------------------------
// Fetch Match Results for Tournament
// ----------------------------------------------------
export async function getMatchResultsAction(tournamentId: string) {
  try {
    const { data: matchResults, error } = await supabase
      .from("match_results")
      .select("*")
      .eq("tournament_id", tournamentId)
      .order("created_at", { ascending: false });

    if (error) throw error;

    const { data: matchPlayerResults, error: playerError } = await supabase
      .from("match_player_results")
      .select("*")
      .eq("tournament_id", tournamentId)
      .order("placement", { ascending: true });

    if (playerError) throw playerError;

    return { success: true, matchResults: matchResults || [], matchPlayerResults: matchPlayerResults || [] };
  } catch (error: any) {
    console.error("Error fetching match results:", error);
    return { success: false, error: error.message, matchResults: [], matchPlayerResults: [] };
  }
}

// ----------------------------------------------------
// Discord Webhook Notifications
// ----------------------------------------------------
async function sendDiscordWebhook(embed: Record<string, any>) {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
  if (!webhookUrl) {
    console.log("DISCORD_WEBHOOK_URL not configured, skipping webhook");
    return;
  }

  try {
    await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ embeds: [embed] }),
    });
  } catch (err) {
    console.error("Discord webhook error:", err);
  }
}

function buildTournamentWebhookEmbed(tournament: any, lobbies: any[], type: "created" | "scored" | "finished") {
  const colors = { created: 0x8b5cf6, scored: 0x22c55e, finished: 0xf59e0b };
  const titles = {
    created: "🏆 GIẢI ĐẤU MỚI ĐƯỢC TẠO",
    scored: "📊 KẾT QUẢ TRẬN ĐẤU MỚI",
    finished: "👑 GIẢI ĐẤU ĐÃ KẾT THÚC",
  };

  const embed: Record<string, any> = {
    title: titles[type],
    color: colors[type],
    timestamp: new Date().toISOString(),
    footer: { text: "TFT Tournament Dashboard" },
  };

  if (type === "created") {
    embed.description = `Giải đấu **${tournament.name}** đã được tạo trên Dashboard!`;
    embed.fields = [
      { name: "Chế độ", value: tournament.mode === "checkmate" ? "⚔️ Checkmate" : "📊 Giải thường", inline: true },
      { name: "Số lobby", value: `${lobbies.length}`, inline: true },
      { name: "Đăng ký", value: "🟢 Đang mở", inline: true },
    ];
    if (tournament.mode === "checkmate") {
      embed.fields.push({ name: "Mốc Checkmate", value: `${tournament.checkmate_score} điểm`, inline: true });
    }
    embed.fields.push({
      name: "🔗 Xem chi tiết",
      value: `[Mở Dashboard](${process.env.NEXT_PUBLIC_WEB_URL || "https://tactics-tournament.vercel.app"}/tournaments/${tournament.id})`,
      inline: false,
    });
  }

  return embed;
}

// ----------------------------------------------------
// Auto Scoring (Riot API)
// ----------------------------------------------------
async function getRiotData(url: string) {
  const apiKey = process.env.RIOT_API_KEY;
  if (!apiKey) throw new Error("Missing RIOT_API_KEY in .env.local");

  const res = await fetch(url, {
    headers: {
      "X-Riot-Token": apiKey,
    },
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Riot API request failed with status ${res.status}: ${errText}`);
  }

  return await res.json();
}

// ----------------------------------------------------
// TFT Rank API
// ----------------------------------------------------
export async function getTftRankByPuuid(puuid: string) {
  try {
    // 1. Check cache in Supabase
    const { data: player } = await supabase
      .from("players")
      .select("id, tft_tier, tft_rank, tft_lp, tft_wins, tft_losses, tft_rank_updated_at")
      .eq("puuid", puuid)
      .maybeSingle();

    const CACHE_HOURS = 2; // Cache Riot API data for 2 hours to avoid limits and increase speed
    if (player && player.tft_rank_updated_at) {
      const updatedAt = new Date(player.tft_rank_updated_at);
      const now = new Date();
      const diffHours = (now.getTime() - updatedAt.getTime()) / (1000 * 60 * 60);
      
      if (diffHours < CACHE_HOURS) {
        return {
          tier: player.tft_tier || "UNRANKED",
          rank: player.tft_rank || "",
          lp: player.tft_lp ?? 0,
          wins: player.tft_wins ?? 0,
          losses: player.tft_losses ?? 0,
          winRate: (player.tft_wins ?? 0) + (player.tft_losses ?? 0) > 0 
            ? Math.round(((player.tft_wins ?? 0) / ((player.tft_wins ?? 0) + (player.tft_losses ?? 0))) * 100) 
            : 0
        };
      }
    }

    // 2. Fetch from Riot API
    const url = `https://vn2.api.riotgames.com/tft/league/v1/by-puuid/${puuid}`;
    const entries = await getRiotData(url);

    if (!Array.isArray(entries) || entries.length === 0) {
      return null;
    }

    // Find ranked TFT entry (queueType === "RANKED_TFT")
    const ranked = entries.find((e: any) => e.queueType === "RANKED_TFT") || entries[0];
    
    const result = {
      tier: ranked.tier || "UNRANKED",
      rank: ranked.rank || "",
      lp: ranked.leaguePoints ?? 0,
      wins: ranked.wins ?? 0,
      losses: ranked.losses ?? 0,
      winRate:
        (ranked.wins ?? 0) + (ranked.losses ?? 0) > 0
          ? Math.round((ranked.wins / (ranked.wins + ranked.losses)) * 100)
          : 0,
    };

    // 3. Save cache to Supabase
    if (player) {
      await supabase.from("players").update({
        tft_tier: result.tier,
        tft_rank: result.rank,
        tft_lp: result.lp,
        tft_wins: result.wins,
        tft_losses: result.losses,
        tft_rank_updated_at: new Date().toISOString()
      }).eq("id", player.id);
    }

    return result;
  } catch (err: any) {
    console.error("Lỗi lấy TFT rank:", err.message);
    return null;
  }
}

export async function autoScoreLobbyAction(tournamentId: string, lobbyId: string) {
  try {
    // 1. Fetch lobby players
    const { data: players, error: fetchError } = await supabase
      .from("lobby_players")
      .select("*")
      .eq("lobby_id", lobbyId);

    if (fetchError) throw fetchError;
    if (!players || players.length !== 8) {
      throw new Error("Lobby phải có đủ 8 người đăng ký mới có thể tính điểm!");
    }

    // 2. Fetch matches for all players
    const matchMap: Record<string, string[]> = {}; // matchId -> array of player puuids

    for (const player of players) {
      const puuid = player.puuid;
      const url = `https://sea.api.riotgames.com/tft/match/v1/matches/by-puuid/${puuid}/ids?start=0&count=5`;
      
      try {
        const matchIds = await getRiotData(url);
        if (Array.isArray(matchIds)) {
          for (const matchId of matchIds) {
            if (!matchMap[matchId]) {
              matchMap[matchId] = [];
            }
            matchMap[matchId].push(puuid);
          }
        }
      } catch (err: any) {
        console.error(`Lỗi khi lấy trận của người chơi ${player.riot_id}:`, err);
        throw new Error(`Lỗi lấy trận của ${player.riot_id} qua Riot API: ${err.message}`);
      }

      // Small delay to dodge Riot API rate limit slightly (20 requests per 1s / 100 per 2m standard key limit)
      await new Promise((resolve) => setTimeout(resolve, 150));
    }

    // 3. Find the best match candidate (one that contains all 8 players)
    const candidates = Object.entries(matchMap)
      .map(([matchId, puuids]) => ({
        matchId,
        count: puuids.length,
        puuids,
      }))
      .sort((a, b) => b.count - a.count);

    const bestMatch = candidates[0];

    if (!bestMatch || bestMatch.count < 8) {
      throw new Error(
        `Không tìm thấy trận chung nào có đủ 8 người chơi trong 5 trận gần nhất. Trận trùng nhau nhiều nhất chỉ có ${bestMatch ? bestMatch.count : 0}/8 người chơi.`
      );
    }

    const matchId = bestMatch.matchId;

    // Check if match already scored to prevent double-scoring
    const { data: existingMatch } = await supabase
      .from("match_results")
      .select("id")
      .eq("match_id", matchId)
      .maybeSingle();

    if (existingMatch) {
      throw new Error(`Trận đấu này (Match ID: ${matchId}) đã được tính điểm trước đó!`);
    }

    // 4. Fetch details of the match
    const matchDetailUrl = `https://sea.api.riotgames.com/tft/match/v1/matches/${matchId}`;
    const matchData = await getRiotData(matchDetailUrl);

    if (!matchData || !matchData.info || !matchData.info.participants) {
      throw new Error(`Dữ liệu trận đấu ${matchId} không hợp lệ từ Riot API`);
    }

    const participants = matchData.info.participants as any[];

    // 5. Update placements
    for (const player of players) {
      const p = participants.find((part) => part.puuid === player.puuid);
      if (!p) {
        throw new Error(`Không tìm thấy dữ liệu người chơi ${player.riot_id} trong trận đấu!`);
      }

      const placement = p.placement as number;
      const points = POINTS_BY_PLACEMENT[placement] || 0;

      const { error: updateError } = await supabase
        .from("lobby_players")
        .update({
          placement,
          points,
          match_id: matchId,
          verified: true,
          updated_at: new Date().toISOString(),
        })
        .eq("id", player.id);

      if (updateError) throw updateError;
    }

    // 6. Save raw match result
    const { error: insertMatchErr } = await supabase
      .from("match_results")
      .insert({
        tournament_id: tournamentId,
        lobby_id: lobbyId,
        match_id: matchId,
        raw_data: matchData,
      });

    if (insertMatchErr) throw insertMatchErr;

    // 7. Recalculate standings
    await recalculateStandingsAction(tournamentId);

    revalidatePath(`/tournaments/${tournamentId}`);
    return { success: true, message: `Tính điểm thành công trận đấu ${matchId}!`, matchId };
  } catch (error: any) {
    console.error("Error auto scoring lobby:", error);
    return { success: false, error: error.message };
  }
}
