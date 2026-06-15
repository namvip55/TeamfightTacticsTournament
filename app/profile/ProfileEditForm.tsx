"use client";

import { useState, useRef } from "react";
import { updateProfileAction } from "../lib/player-actions";
import { cn } from "@/lib/utils";
import { User, Loader2, CheckCircle2, XCircle, Upload, Film } from "lucide-react";

interface ProfileEditFormProps {
  displayName: string;
  bio: string;
  socialLinks: Record<string, string>;
  profileBgUrl: string;
}

export default function ProfileEditForm({
  displayName: initialName,
  bio: initialBio,
  socialLinks: initialLinks,
  profileBgUrl: initialBgUrl,
}: ProfileEditFormProps) {
  const [displayName, setDisplayName] = useState(initialName);
  const [bio, setBio] = useState(initialBio);
  const [twitter, setTwitter] = useState(initialLinks.twitter || "");
  const [facebook, setFacebook] = useState(initialLinks.facebook || "");
  const [tags, setTags] = useState(initialLinks.tags || "");
  const [profileBgUrl, setProfileBgUrl] = useState(initialBgUrl || "");
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState("");
  const [message, setMessage] = useState<{
    text: string;
    type: "success" | "error";
  } | null>(null);
  const xhrRef = useRef<XMLHttpRequest | null>(null);

  const handleBgUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Client-side validation
    const MAX_SIZE = 10 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      setUploadError("Kích thước file tối đa là 10MB");
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    setUploadError("");
    setMessage(null);

    const formData = new FormData();
    formData.append("bg_file", file);

    const xhr = new XMLHttpRequest();
    xhrRef.current = xhr;

    xhr.upload.addEventListener("progress", (event) => {
      if (event.lengthComputable) {
        const pct = Math.round((event.loaded / event.total) * 100);
        setUploadProgress(pct);
      }
    });

    xhr.addEventListener("load", () => {
      xhrRef.current = null;
      setIsUploading(false);
      try {
        const result = JSON.parse(xhr.responseText);
        if (xhr.status === 200 && result.success && result.bgUrl) {
          setProfileBgUrl(result.bgUrl);
          setUploadProgress(100);
          setMessage({ text: "Tải lên file nền thành công!", type: "success" });
        } else {
          setUploadError(result.error || "Lỗi tải lên file nền");
        }
      } catch {
        setUploadError("Lỗi xử lý phản hồi từ server");
      }
    });

    xhr.addEventListener("error", () => {
      xhrRef.current = null;
      setIsUploading(false);
      setUploadError("Lỗi kết nối mạng khi tải lên");
    });

    xhr.addEventListener("abort", () => {
      xhrRef.current = null;
      setIsUploading(false);
      setUploadProgress(0);
    });

    xhr.open("POST", "/api/upload-bg");
    xhr.send(formData);
  };

  const handleCancelUpload = () => {
    if (xhrRef.current) {
      xhrRef.current.abort();
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setMessage(null);

    const socialLinks: Record<string, string> = {
      twitter: twitter.trim(),
      facebook: facebook.trim(),
      tags: tags.trim()
    };

    const result = await updateProfileAction({
      display_name: displayName,
      bio,
      social_links: socialLinks,
      profile_bg_url: profileBgUrl,
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

        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] text-zinc-500 font-mono uppercase font-bold">
            Nhãn Cá Nhân (Gồm nhiều nhãn, ngăn cách bằng dấu phẩy)
          </label>
          <input
            type="text"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="Ví dụ: Challenger, Flex Player, Fast 8..."
            className="w-full bg-white/[0.03] border border-white/[0.08] rounded-lg px-3 py-2.5 text-sm font-mono text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-violet-500/50"
          />
          <span className="text-[9px] text-zinc-500 font-mono">
            *Thiết lập các nhãn hiển thị trên thẻ anh hùng của bạn (ví dụ: Tactician, Challenger, Flex Play...). Trống sẽ không hiển thị nhãn nào.
          </span>
        </div>

        <div className="flex flex-col gap-2 bg-white/[0.01] border border-white/[0.06] rounded-xl p-4">
          <label className="text-[10px] text-zinc-400 font-mono uppercase font-bold tracking-wider">
            Hình Nền / Video Trang Cá Nhân
          </label>
          
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            {/* File Upload Button */}
            <div className="w-full sm:w-auto">
              <label className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] hover:border-violet-500/30 text-xs text-zinc-300 font-bold font-mono rounded-lg cursor-pointer transition-all duration-200">
                {isUploading ? (
                  <Loader2 className="w-4 h-4 text-violet-400 animate-spin" />
                ) : (
                  <Upload className="w-4 h-4 text-violet-400" />
                )}
                {isUploading ? "Đang tải lên..." : "Tải Lên File (Max 10MB)"}
                <input
                  type="file"
                  accept="image/*,video/mp4,video/webm,video/ogg"
                  onChange={handleBgUpload}
                  disabled={isUploading}
                  className="hidden"
                />
              </label>
            </div>
            
            <div className="text-[10px] text-zinc-500 font-mono text-center sm:text-left">
              Hỗ trợ tải lên ảnh (PNG, JPG, GIF...) hoặc video vòng lặp (.mp4, .webm). Giới hạn 10MB.
            </div>
          </div>

          {isUploading && (
            <div className="w-full bg-white/[0.03] border border-white/[0.08] rounded-lg p-3 flex flex-col gap-2 mt-1">
              <div className="flex justify-between items-center text-xs font-mono text-zinc-400">
                <span className="flex items-center gap-1.5">
                  <Loader2 className="w-3.5 h-3.5 text-violet-400 animate-spin" />
                  Đang tải lên: {uploadProgress}%
                </span>
                <button
                  type="button"
                  onClick={handleCancelUpload}
                  className="text-rose-400 hover:text-rose-300 font-bold hover:underline"
                >
                  Hủy
                </button>
              </div>
              <div className="w-full h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-violet-500 to-fuchsia-500 transition-all duration-150"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          <div className="relative flex items-center justify-center py-2.5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/[0.06]" />
            </div>
            <span className="relative px-3 bg-[#0d0c15] text-[9px] text-zinc-500 font-mono uppercase">Hoặc dán URL liên kết</span>
          </div>

          <div className="flex flex-col gap-1.5">
            <input
              type="text"
              value={profileBgUrl}
              onChange={(e) => setProfileBgUrl(e.target.value)}
              placeholder="https://domain.com/background.mp4 hoặc .png"
              className="w-full bg-white/[0.02] border border-white/[0.08] rounded-lg px-3 py-2 text-xs font-mono text-zinc-300 placeholder:text-zinc-600 focus:outline-none focus:border-violet-500/50"
            />
          </div>

          {uploadError && (
            <div className="p-3 rounded-lg border border-rose-500/20 bg-rose-500/10 text-rose-400 text-xs font-mono flex items-center gap-2 mt-2">
              <XCircle className="w-3.5 h-3.5" />
              {uploadError}
            </div>
          )}
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
