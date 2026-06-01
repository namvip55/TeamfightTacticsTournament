"use server";

import { cookies } from "next/headers";
import { supabase } from "./supabase";
import { verifySessionToken, type PlayerSession } from "./discord-auth";

const PLAYER_COOKIE_NAME = "player_session";

/**
 * Lấy player session từ cookie
 */
export async function getPlayerSession(): Promise<PlayerSession | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(PLAYER_COOKIE_NAME)?.value;

  if (!token) return null;

  const payload = await verifySessionToken(token);
  if (!payload) return null;

  // Lấy thông tin player mới nhất từ DB
  const { data: player } = await supabase
    .from("players")
    .select("id, discord_id, discord_username, display_name, avatar_url, discord_avatar_url, diamonds")
    .eq("id", payload.playerId)
    .maybeSingle();

  if (!player) return null;

  return {
    playerId: player.id,
    discordId: player.discord_id,
    discordUsername: player.discord_username || "",
    discordAvatar: player.discord_avatar_url || "",
    displayName: player.display_name,
    avatarUrl: player.avatar_url,
    diamonds: player.diamonds,
  };
}

/**
 * Yêu cầu player phải đăng nhập, nếu không throw error
 */
export async function requirePlayerAuth(): Promise<PlayerSession> {
  const session = await getPlayerSession();
  if (!session) {
    throw new Error("Bạn cần đăng nhập để thực hiện hành động này");
  }
  return session;
}

/**
 * Set player session cookie
 */
export async function setPlayerSessionCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set(PLAYER_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60, // 7 ngày
    path: "/",
  });
}

/**
 * Xóa player session cookie
 */
export async function clearPlayerSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(PLAYER_COOKIE_NAME);
}
