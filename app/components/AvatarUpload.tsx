"use client";

import { useState, useRef } from "react";
import { Camera, X, Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { uploadAvatarAction } from "../lib/player-actions";

interface AvatarUploadProps {
  currentAvatarUrl: string | null;
  discordAvatarUrl: string | null;
  displayName: string;
  discordUsername: string;
}

export default function AvatarUpload({
  currentAvatarUrl,
  discordAvatarUrl,
  displayName,
  discordUsername,
}: AvatarUploadProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const displayAvatar = currentAvatarUrl || discordAvatarUrl;
  const initial = (displayName || discordUsername || "?")[0].toUpperCase();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setSuccess(false);

    const allowedTypes = ["image/png", "image/jpeg", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      setError("Chỉ chấp nhận PNG, JPG, WebP");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setError("Tối đa 2MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    const file = fileInputRef.current?.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setError(null);
    setSuccess(false);

    const formData = new FormData();
    formData.append("avatar", file);

    const result = await uploadAvatarAction(formData);

    setIsUploading(false);

    if (result.success) {
      setSuccess(true);
      setPreview(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } else {
      setError(result.error || "Upload thất bại");
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Avatar Display */}
      <div className="relative group">
        <div className="w-32 h-32 rounded-full overflow-hidden border-2 border-violet-500/30 bg-violet-500/10 shadow-[0_0_25px_rgba(139,92,246,0.2)]">
          {preview ? (
            <img
              src={preview}
              alt="Preview"
              className="w-full h-full object-cover"
            />
          ) : displayAvatar ? (
            <img
              src={displayAvatar}
              alt="Avatar"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-violet-500/20 text-violet-400 text-4xl font-bold leading-none">
              {initial}
            </div>
          )}
        </div>
        <button
          onClick={() => fileInputRef.current?.click()}
          className="absolute inset-0 rounded-full bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
        >
          <Camera className="w-5 h-5 text-white" />
        </button>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Upload button when preview exists */}
      {preview && (
        <div className="flex gap-2">
          <button
            onClick={handleUpload}
            disabled={isUploading}
            className="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white text-xs font-mono font-bold rounded-lg transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-2"
          >
            {isUploading ? (
              <>
                <Loader2 className="w-3 h-3 animate-spin" />
                Đang upload...
              </>
            ) : (
              <>
                <Check className="w-3 h-3" />
                Lưu Avatar
              </>
            )}
          </button>
          <button
            onClick={() => {
              setPreview(null);
              setError(null);
              if (fileInputRef.current) fileInputRef.current.value = "";
            }}
            className="px-4 py-2 bg-white/[0.04] border border-white/[0.08] text-zinc-400 text-xs font-mono font-bold rounded-lg hover:text-zinc-200 transition-colors cursor-pointer flex items-center gap-2"
          >
            <X className="w-3 h-3" />
            Hủy
          </button>
        </div>
      )}

      {/* Messages */}
      {error && <p className="text-rose-400 text-xs font-mono">{error}</p>}
      {success && (
        <p className="text-green-400 text-xs font-mono flex items-center gap-1">
          <Check className="w-3 h-3" /> Đã cập nhật avatar!
        </p>
      )}

      <p className="text-zinc-600 text-[10px] font-mono">
        PNG, JPG, WebP • Tối đa 2MB
      </p>
    </div>
  );
}
