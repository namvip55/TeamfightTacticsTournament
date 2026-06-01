"use server";

import { supabase } from "./supabase";

const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID!;
const DISCORD_CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET!;

// Production domain - dùng domain chính, không dùng VERCEL_URL (preview URLs khác domain)
const DISCORD_REDIRECT_URI =
  process.env.DISCORD_REDIRECT_URI ||
  "https://tactics-tournament.vercel.app/api/auth/callback";

export interface DiscordUser {
  id: string;
  username: string;
  discriminator: string;
  avatar: string;
  global_name?: string;
}

export interface PlayerSession {
  playerId: string;
  discordId: string;
  discordUsername: string;
  discordAvatar: string;
  displayName: string | null;
  avatarUrl: string | null;
  diamonds: number;
}

/**
 * Tạo URL redirect tới Discord OAuth2
 */
export async function getDiscordAuthUrl(): Promise<string> {
  const params = new URLSearchParams({
    client_id: DISCORD_CLIENT_ID,
    redirect_uri: DISCORD_REDIRECT_URI,
    response_type: "code",
    scope: "identify",
  });
  return `https://discord.com/api/oauth2/authorize?${params.toString()}`;
}

/**
 * Đổi authorization code lấy access token
 */
export async function exchangeDiscordCode(code: string): Promise<{
  access_token: string;
  token_type: string;
  expires_in: number;
  scope: string;
}> {
  const res = await fetch("https://discord.com/api/oauth2/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      client_id: DISCORD_CLIENT_ID,
      client_secret: DISCORD_CLIENT_SECRET,
      grant_type: "authorization_code",
      code,
      redirect_uri: DISCORD_REDIRECT_URI,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Discord token exchange failed: ${err}`);
  }

  return res.json();
}

/**
 * Lấy thông tin user từ Discord API
 */
export async function getDiscordUser(access_token: string): Promise<DiscordUser> {
  const res = await fetch("https://discord.com/api/users/@me", {
    headers: {
      Authorization: `Bearer ${access_token}`,
    },
  });

  if (!res.ok) {
    throw new Error("Failed to fetch Discord user");
  }

  return res.json();
}

/**
 * Lấy avatar URL từ Discord user
 */
export async function getDiscordAvatarUrl(user: DiscordUser): Promise<string | null> {
  if (!user.avatar) return null;
  const ext = user.avatar.startsWith("a_") ? "gif" : "png";
  return `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.${ext}?size=256`;
}

/**
 * Tìm hoặc tạo player record từ Discord user
 */
export async function findOrCreatePlayer(discordUser: DiscordUser) {
  // Tìm player hiện tại
  const { data: existingPlayer } = await supabase
    .from("players")
    .select("*")
    .eq("discord_id", discordUser.id)
    .maybeSingle();

  if (existingPlayer) {
    // Cập nhật discord info nếu thay đổi
    const avatarUrl = getDiscordAvatarUrl(discordUser);
    const updates: Record<string, any> = {};

    if (existingPlayer.discord_username !== discordUser.username) {
      updates.discord_username = discordUser.username;
    }
    if (avatarUrl && existingPlayer.discord_avatar_url !== avatarUrl) {
      updates.discord_avatar_url = avatarUrl;
    }

    if (Object.keys(updates).length > 0) {
      updates.updated_at = new Date().toISOString();
      await supabase.from("players").update(updates).eq("id", existingPlayer.id);
    }

    return existingPlayer;
  }

  // Nếu chưa có player record, tạo mới (không có riot_id vì chưa đăng ký TFT)
  // Trả về null - user cần đăng ký TFT qua Discord bot trước
  return null;
}

/**
 * Tạo session token cho player
 */
export async function createSessionToken(playerId: string, discordId: string): Promise<string> {
  // Simple JWT-like token (trong production nên dùng library JWT)
  const payload = {
    playerId,
    discordId,
    exp: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 ngày
  };
  return Buffer.from(JSON.stringify(payload)).toString("base64url");
}

/**
 * Verify session token
 */
export async function verifySessionToken(token: string): Promise<{
  playerId: string;
  discordId: string;
} | null> {
  try {
    const payload = JSON.parse(Buffer.from(token, "base64url").toString());

    if (payload.exp < Date.now()) {
      return null; // Token expired
    }

    return {
      playerId: payload.playerId,
      discordId: payload.discordId,
    };
  } catch {
    return null;
  }
}
