import { NextResponse } from "next/server";
import { getDiscordAuthUrl } from "../../../lib/discord-auth";

export async function GET() {
  const authUrl = await getDiscordAuthUrl();
  return NextResponse.redirect(authUrl);
}
