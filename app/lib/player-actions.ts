"use server";

import { revalidatePath } from "next/cache";
import { supabase } from "./supabase";
import { requirePlayerAuth, getPlayerSession } from "./player-auth";
import { cookies } from "next/headers";

// ----------------------------------------------------
// Profile Actions
// ----------------------------------------------------

/**
 * Cập nhật profile cá nhân (tên hiển thị, bio, social links)
 */
export async function updateProfileAction(data: {
  display_name?: string;
  bio?: string;
  social_links?: Record<string, string>;
  profile_bg_url?: string;
}) {
  const session = await requirePlayerAuth();

  try {
    const updates: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };

    if (data.display_name !== undefined) {
      updates.display_name = data.display_name.trim() || null;
    }
    if (data.bio !== undefined) {
      updates.bio = data.bio.trim().slice(0, 500); // Max 500 chars
    }
    if (data.social_links !== undefined) {
      updates.social_links = data.social_links;
    }
    if (data.profile_bg_url !== undefined) {
      updates.profile_bg_url = data.profile_bg_url.trim() || null;
    }

    const { error } = await supabase
      .from("players")
      .update(updates)
      .eq("id", session.playerId);

    if (error) throw error;

    revalidatePath("/profile");
    revalidatePath(`/player/${session.playerId}`);
    return { success: true };
  } catch (error: any) {
    console.error("Error updating profile:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Upload avatar - nhận file và upload lên Supabase Storage
 */
export async function uploadAvatarAction(formData: FormData) {
  const session = await requirePlayerAuth();

  try {
    const file = formData.get("avatar") as File;
    if (!file) {
      throw new Error("Không tìm thấy file ảnh");
    }

    // Validate file type
    const allowedTypes = ["image/png", "image/jpeg", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      throw new Error("Chỉ chấp nhận file PNG, JPG, WebP");
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      throw new Error("Kích thước file tối đa 2MB");
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Generate unique filename
    const ext = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
    const filePath = `${session.discordId}/avatar.${ext}`;

    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: true, // Ghi đè nếu đã tồn tại
      });

    if (uploadError) throw uploadError;

    // Get public URL
    const { data: urlData } = supabase.storage
      .from("avatars")
      .getPublicUrl(filePath);

    const avatarUrl = `${urlData.publicUrl}?t=${Date.now()}`; // Cache bust

    // Update player record
    const { error: updateError } = await supabase
      .from("players")
      .update({
        avatar_url: avatarUrl,
        updated_at: new Date().toISOString(),
      })
      .eq("id", session.playerId);

    if (updateError) throw updateError;

    revalidatePath("/profile");
    revalidatePath(`/player/${session.playerId}`);
    return { success: true, avatarUrl };
  } catch (error: any) {
    console.error("Error uploading avatar:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Upload hình nền hoặc video nền cho profile (giới hạn 10MB)
 */
export async function uploadProfileBgAction(formData: FormData) {
  const session = await requirePlayerAuth();

  try {
    const file = formData.get("bg_file") as File;
    if (!file) {
      throw new Error("Không tìm thấy file tải lên");
    }

    // Validate file type (Images + Videos)
    const allowedTypes = [
      "image/png", "image/jpeg", "image/webp", "image/gif",
      "video/mp4", "video/webm", "video/ogg"
    ];
    if (!allowedTypes.includes(file.type)) {
      throw new Error("Chỉ chấp nhận file ảnh (PNG, JPG, WebP, GIF) hoặc video (MP4, WebM)");
    }

    // Validate size (max 10MB)
    const MAX_SIZE = 10 * 1024 * 1024; // 10MB
    if (file.size > MAX_SIZE) {
      throw new Error("Kích thước file tải lên tối đa là 10MB");
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Get file extension
    let ext = "mp4";
    if (file.type.startsWith("image/")) {
      ext = file.type.split("/")[1] || "png";
    } else if (file.type.startsWith("video/")) {
      ext = file.type.split("/")[1] || "mp4";
    }

    const filePath = `${session.discordId}/bg_visual.${ext}`;

    // Upload to Supabase Storage ('avatars' bucket)
    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: true,
      });

    if (uploadError) throw uploadError;

    // Get public URL
    const { data: urlData } = supabase.storage
      .from("avatars")
      .getPublicUrl(filePath);

    const bgUrl = `${urlData.publicUrl}?t=${Date.now()}`;

    // Update player record
    const { error: updateError } = await supabase
      .from("players")
      .update({
        profile_bg_url: bgUrl,
        updated_at: new Date().toISOString(),
      })
      .eq("id", session.playerId);

    if (updateError) throw updateError;

    revalidatePath("/profile");
    revalidatePath(`/player/${session.playerId}`);
    return { success: true, bgUrl };
  } catch (error: any) {
    console.error("Error uploading profile background:", error);
    return { success: false, error: error.message };
  }
}

// ----------------------------------------------------
// Diamond Actions (Admin)
// ----------------------------------------------------

/**
 * Admin trao giải kim cương cho Top 4
 */
export async function awardDiamondsAction(
  tournamentId: string,
  prizes: { playerId: string; amount: number; rank: number }[]
) {
  try {
    // Verify admin
    const cookieStore = await cookies();
    const adminSession = cookieStore.get("admin_session")?.value;
    if (!adminSession) {
      throw new Error("Cần quyền quản trị viên");
    }

    // Get tournament info
    const { data: tournament, error: tErr } = await supabase
      .from("tournaments")
      .select("name")
      .eq("id", tournamentId)
      .single();

    if (tErr || !tournament) throw new Error("Không tìm thấy giải đấu");

    const results = [];

    for (const prize of prizes) {
      if (prize.amount <= 0) continue;

      // 1. Cộng kim cương cho player
      const { data: player, error: pErr } = await supabase
        .from("players")
        .select("id, diamonds, riot_id")
        .eq("id", prize.playerId)
        .single();

      if (pErr || !player) {
        results.push({ playerId: prize.playerId, success: false, error: "Player not found" });
        continue;
      }

      const newDiamonds = (player.diamonds || 0) + prize.amount;

      const { error: updateError } = await supabase
        .from("players")
        .update({
          diamonds: newDiamonds,
          updated_at: new Date().toISOString(),
        })
        .eq("id", prize.playerId);

      if (updateError) {
        results.push({ playerId: prize.playerId, success: false, error: updateError.message });
        continue;
      }

      // 2. Ghi lịch sử giao dịch
      const rankLabels: Record<number, string> = {
        1: "Vô địch (Top 1)",
        2: "Á quân (Top 2)",
        3: "Hạng 3 (Top 3)",
        4: "Hạng 4 (Top 4)",
      };

      await supabase.from("diamond_transactions").insert({
        player_id: prize.playerId,
        amount: prize.amount,
        reason: "tournament_prize",
        tournament_id: tournamentId,
        admin_note: `Giải "${tournament.name}" - ${rankLabels[prize.rank] || `Top ${prize.rank}`}`,
      });

      // 3. Tạo trophy cho Top 1
      if (prize.rank === 1) {
        await supabase.from("trophies").upsert(
          {
            player_id: prize.playerId,
            tournament_id: tournamentId,
            trophy_type: "champion",
            tournament_name: tournament.name,
          },
          { onConflict: "player_id,tournament_id,trophy_type" }
        );

        // Cập nhật winner info cho tournament
        await supabase
          .from("tournaments")
          .update({
            winner_player_id: prize.playerId,
            winner_riot_id: player.riot_id,
            finished_at: new Date().toISOString(),
            status: "completed",
          })
          .eq("id", tournamentId);
      } else if (prize.rank === 2) {
        await supabase.from("trophies").upsert(
          {
            player_id: prize.playerId,
            tournament_id: tournamentId,
            trophy_type: "runner_up",
            tournament_name: tournament.name,
          },
          { onConflict: "player_id,tournament_id,trophy_type" }
        );
      } else if (prize.rank === 3) {
        await supabase.from("trophies").upsert(
          {
            player_id: prize.playerId,
            tournament_id: tournamentId,
            trophy_type: "third",
            tournament_name: tournament.name,
          },
          { onConflict: "player_id,tournament_id,trophy_type" }
        );
      }

      results.push({
        playerId: prize.playerId,
        riotId: player.riot_id,
        success: true,
        newBalance: newDiamonds,
      });
    }

    revalidatePath("/admin");
    revalidatePath("/");
    return { success: true, results };
  } catch (error: any) {
    console.error("Error awarding diamonds:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Admin điều chỉnh kim cương thủ công
 */
export async function adjustDiamondsAction(
  playerId: string,
  amount: number,
  reason: string
) {
  try {
    const cookieStore = await cookies();
    const adminSession = cookieStore.get("admin_session")?.value;
    if (!adminSession) {
      throw new Error("Cần quyền quản trị viên");
    }

    const { data: player, error: pErr } = await supabase
      .from("players")
      .select("id, diamonds")
      .eq("id", playerId)
      .single();

    if (pErr || !player) throw new Error("Không tìm thấy người chơi");

    const newDiamonds = Math.max(0, (player.diamonds || 0) + amount);

    const { error: updateError } = await supabase
      .from("players")
      .update({
        diamonds: newDiamonds,
        updated_at: new Date().toISOString(),
      })
      .eq("id", playerId);

    if (updateError) throw updateError;

    await supabase.from("diamond_transactions").insert({
      player_id: playerId,
      amount,
      reason: "admin_adjust",
      admin_note: reason,
    });

    revalidatePath("/admin");
    return { success: true, newBalance: newDiamonds };
  } catch (error: any) {
    console.error("Error adjusting diamonds:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Lấy lịch sử kim cương của player
 */
export async function getDiamondHistoryAction(playerId?: string) {
  const session = await getPlayerSession();
  const targetId = playerId || session?.playerId;

  if (!targetId) return { success: false, transactions: [] };

  const { data: transactions } = await supabase
    .from("diamond_transactions")
    .select("*, tournaments(name)")
    .eq("player_id", targetId)
    .order("created_at", { ascending: false })
    .limit(50);

  return { success: true, transactions: transactions || [] };
}

// ----------------------------------------------------
// Shop Actions
// ----------------------------------------------------

/**
 * Lấy danh sách vật phẩm trong shop
 */
export async function getShopItemsAction() {
  const { data: items } = await supabase
    .from("shop_items")
    .select("*")
    .eq("active", true)
    .order("price", { ascending: true });

  return { items: items || [] };
}

/**
 * Mua vật phẩm từ shop
 */
export async function purchaseItemAction(itemId: string) {
  const session = await requirePlayerAuth();

  try {
    // 1. Lấy thông tin item
    const { data: item, error: itemErr } = await supabase
      .from("shop_items")
      .select("*")
      .eq("id", itemId)
      .eq("active", true)
      .single();

    if (itemErr || !item) throw new Error("Vật phẩm không tồn tại hoặc đã ngừng bán");

    // 2. Kiểm tra stock
    if (item.stock !== null && item.stock <= 0) {
      throw new Error("Vật phẩm đã hết hàng");
    }

    // 3. Lấy số dư kim cương
    const { data: player, error: playerErr } = await supabase
      .from("players")
      .select("id, diamonds")
      .eq("id", session.playerId)
      .single();

    if (playerErr || !player) throw new Error("Không tìm thấy thông tin người chơi");

    // 4. Kiểm tra đủ kim cương
    if ((player.diamonds || 0) < item.price) {
      throw new Error(`Cần ${item.price} kim cương, bạn chỉ có ${player.diamonds || 0}`);
    }

    // 5. Trừ kim cương
    const newBalance = (player.diamonds || 0) - item.price;
    const { error: deductError } = await supabase
      .from("players")
      .update({
        diamonds: newBalance,
        updated_at: new Date().toISOString(),
      })
      .eq("id", session.playerId);

    if (deductError) throw deductError;

    // 6. Giảm stock (nếu có giới hạn)
    if (item.stock !== null) {
      await supabase
        .from("shop_items")
        .update({ stock: item.stock - 1 })
        .eq("id", itemId);
    }

    // 7. Ghi nhận purchase
    await supabase.from("shop_purchases").insert({
      player_id: session.playerId,
      item_id: itemId,
      diamonds_spent: item.price,
      status: "completed",
    });

    // 8. Ghi lịch sử kim cương
    await supabase.from("diamond_transactions").insert({
      player_id: session.playerId,
      amount: -item.price,
      reason: "shop_purchase",
      admin_note: `Mua: ${item.name}`,
    });

    revalidatePath("/shop");
    revalidatePath("/profile");
    return {
      success: true,
      newBalance,
      itemName: item.name,
      itemType: item.item_type,
    };
  } catch (error: any) {
    console.error("Error purchasing item:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Admin tạo vật phẩm shop mới
 */
export async function createShopItemAction(data: {
  name: string;
  description: string;
  price: number;
  item_type: string;
  item_data?: Record<string, any>;
  stock?: number | null;
}) {
  try {
    const cookieStore = await cookies();
    const adminSession = cookieStore.get("admin_session")?.value;
    if (!adminSession) {
      throw new Error("Cần quyền quản trị viên");
    }

    const { error } = await supabase.from("shop_items").insert({
      name: data.name.trim(),
      description: data.description?.trim() || null,
      price: Math.max(1, data.price),
      item_type: data.item_type,
      item_data: data.item_data || {},
      stock: data.stock ?? null,
    });

    if (error) throw error;

    revalidatePath("/admin");
    revalidatePath("/shop");
    return { success: true };
  } catch (error: any) {
    console.error("Error creating shop item:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Lấy lịch sử mua hàng của player
 */
export async function getPurchaseHistoryAction() {
  const session = await requirePlayerAuth();

  const { data: purchases } = await supabase
    .from("shop_purchases")
    .select("*, shop_items(name, item_type)")
    .eq("player_id", session.playerId)
    .order("created_at", { ascending: false })
    .limit(20);

  return { purchases: purchases || [] };
}
