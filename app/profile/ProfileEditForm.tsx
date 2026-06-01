"use client";

import { useState } from "react";
import { updateProfileAction } from "../lib/player-actions";
import { cn } from "@/lib/utils";
import { User, Loader2, CheckCircle2, XCircle } from "lucide-react";

interface ProfileEditFormProps {
  displayName: string;
  bio: string;
  socialLinks: Record<string, string>;
}

export default function ProfileEditForm({
  displayName: initialName,
  bio: initialBio,
  socialLinks: initialLinks,
}: ProfileEditFormProps) {
  const [displayName, setDisplayName] = useState(initialName);
  const [bio, setBio] = useState(initialBio);
  const [twitter, setTwitter] = useState(initialLinks.twitter || "");
  const [facebook, setFacebook] = useState(initialLinks.facebook || "");
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{
    text: string;
    type: "success" | "error";
  } | null>(null);

  const handleSave = async () => {
    setIsSaving(true);
    setMessage(null);

    const socialLinks: Record<string, string> = {};
    if (twitter.trim()) socialLinks.twitter = twitter.trim();
    if (facebook.trim()) socialLinks.facebook = facebook.trim();

    const result = await updateProfileAction({
      display_name: displayName,
      bio,
      social_links: socialLinks,
    });

    setIsSaving(false);

    if (result.success) {
      setMessage({ text: "Đã lưu hồ sơ!", type: "success" });
    } else {
      setMessage({ text: result.error || "Lỗi lưu hồ sơ", type: "error" });
    }
  };

  return (
    <div className="glass-card p-6">
      <h3 className="text-sm font-mono font-bold text-violet-400 uppercase mb-5 flex items-center gap-2">
        <User className="w-4 h-4" />
        Chỉnh Sửa Hồ Sơ
      </h3>

      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] text-zinc-500 font-mono uppercase font-bold">
            Tên Hiển Thị
          </label>
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Tên của bạn..."
            maxLength={50}
            className="w-full bg-white/[0.03] border border-white/[0.08] rounded-lg px-3 py-2.5 text-sm font-mono text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-violet-500/50"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] text-zinc-500 font-mono uppercase font-bold">
            Tiểu Sử{" "}
            <span className="text-zinc-600">({bio.length}/500)</span>
          </label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value.slice(0, 500))}
            placeholder="Giới thiệu về bản thân..."
            rows={3}
            className="w-full bg-white/[0.03] border border-white/[0.08] rounded-lg px-3 py-2.5 text-sm font-mono text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-violet-500/50 resize-none"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] text-zinc-500 font-mono uppercase font-bold">
              Twitter / X
            </label>
            <input
              type="text"
              value={twitter}
              onChange={(e) => setTwitter(e.target.value)}
              placeholder="@username"
              className="w-full bg-white/[0.03] border border-white/[0.08] rounded-lg px-3 py-2.5 text-sm font-mono text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-violet-500/50"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] text-zinc-500 font-mono uppercase font-bold">
              Facebook
            </label>
            <input
              type="text"
              value={facebook}
              onChange={(e) => setFacebook(e.target.value)}
              placeholder="username hoặc link"
              className="w-full bg-white/[0.03] border border-white/[0.08] rounded-lg px-3 py-2.5 text-sm font-mono text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-violet-500/50"
            />
          </div>
        </div>

        {message && (
          <div
            className={cn(
              "p-3 rounded-lg border text-xs font-mono flex items-center gap-2",
              message.type === "success"
                ? "bg-green-500/10 text-green-400 border-green-500/20"
                : "bg-rose-500/10 text-rose-400 border-rose-500/20"
            )}
          >
            {message.type === "success" ? (
              <CheckCircle2 className="w-3.5 h-3.5" />
            ) : (
              <XCircle className="w-3.5 h-3.5" />
            )}
            {message.text}
          </div>
        )}

        <button
          onClick={handleSave}
          disabled={isSaving}
          className="w-full py-2.5 bg-gradient-to-r from-violet-600 to-violet-500 hover:from-violet-500 hover:to-violet-400 text-white font-bold text-sm rounded-lg transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isSaving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Đang lưu...
            </>
          ) : (
            "Lưu Hồ Sơ"
          )}
        </button>
      </div>
    </div>
  );
}
