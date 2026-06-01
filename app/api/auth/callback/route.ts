import { NextRequest, NextResponse } from "next/server";
import {
  exchangeDiscordCode,
  getDiscordUser,
  getDiscordAvatarUrl,
  findOrCreatePlayer,
  createSessionToken,
} from "../../../lib/discord-auth";
import { setPlayerSessionCookie } from "../../../lib/player-auth";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");

  if (!code) {
    return NextResponse.redirect(new URL("/?error=no_code", request.url));
  }

  try {
    // 1. Đổi code lấy access token
    const tokenData = await exchangeDiscordCode(code);

    // 2. Lấy thông tin Discord user
    const discordUser = await getDiscordUser(tokenData.access_token);

    // 3. Tìm hoặc tạo player record
    const player = await findOrCreatePlayer(discordUser);

    if (!player) {
      // Player chưa đăng ký TFT qua Discord bot
      return NextResponse.redirect(new URL("/?error=not_registered", request.url));
    }

    // 4. Tạo session token và set cookie
    const sessionToken = await createSessionToken(player.id, discordUser.id);
    await setPlayerSessionCookie(sessionToken);

    // 5. Redirect về trang profile
    return NextResponse.redirect(new URL("/profile", request.url));
  } catch (error: any) {
    console.error("Discord OAuth callback error:", error);
    return NextResponse.redirect(new URL("/?error=auth_failed", request.url));
  }
}
