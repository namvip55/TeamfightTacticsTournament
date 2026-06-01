import { NextRequest, NextResponse } from "next/server";
import { clearPlayerSessionCookie } from "../../../lib/player-auth";

export async function GET(request: NextRequest) {
  await clearPlayerSessionCookie();
  return NextResponse.redirect(new URL("/", request.url));
}
