import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/app/lib/supabase";
import { getPlayerSession } from "@/app/lib/player-auth";

export const runtime = "nodejs";

// Increase body size limit for video uploads
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const session = await getPlayerSession();
    if (!session?.playerId) {
      return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("bg_file") as File;
    if (!file) {
      return NextResponse.json({ error: "Không tìm thấy file" }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = [
      "image/png", "image/jpeg", "image/webp", "image/gif",
      "video/mp4", "video/webm", "video/ogg"
    ];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Chỉ chấp nhận ảnh (PNG, JPG, WebP, GIF) hoặc video (MP4, WebM)" },
        { status: 400 }
      );
    }

    // Validate size (max 10MB)
    const MAX_SIZE = 10 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: "Kích thước file tối đa là 10MB" },
        { status: 400 }
      );
    }

    // Get extension
    let ext = "mp4";
    if (file.type.startsWith("image/")) {
      ext = file.type.split("/")[1] || "png";
    } else if (file.type.startsWith("video/")) {
      ext = file.type.split("/")[1] || "mp4";
    }

    const filePath = `${session.discordId}/bg_visual.${ext}`;

    // Convert to ArrayBuffer and upload
    const arrayBuffer = await file.arrayBuffer();

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(filePath, arrayBuffer, {
        contentType: file.type,
        upsert: true,
      });

    if (uploadError) {
      console.error("Storage upload error:", uploadError);
      return NextResponse.json(
        { error: `Lỗi upload: ${uploadError.message}` },
        { status: 500 }
      );
    }

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

    if (updateError) {
      console.error("DB update error:", updateError);
      return NextResponse.json(
        { error: `Lỗi cập nhật: ${updateError.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, bgUrl });
  } catch (error: any) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: error.message || "Lỗi không xác định" },
      { status: 500 }
    );
  }
}
