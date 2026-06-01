"use client";

import { useState } from "react";
import Link from "next/link";
import {
  User,
  ShoppingBag,
  BarChart3,
  LogOut,
  ChevronDown,
  Gem,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface PlayerMenuProps {
  session: {
    playerId: string;
    discordId: string;
    discordUsername: string;
    discordAvatar: string;
    displayName: string | null;
    avatarUrl: string | null;
    diamonds: number;
  } | null;
}

export default function PlayerMenu({ session }: PlayerMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (!session) {
    return (
      <a
        href="/api/auth/login"
        className="flex items-center gap-2 px-3 py-2 bg-[#5865F2]/10 hover:bg-[#5865F2]/20 border border-[#5865F2]/20 text-[#5865F2] text-xs font-mono font-bold rounded-lg transition-colors"
      >
        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189z" />
        </svg>
        Đăng nhập
      </a>
    );
  }

  const avatar = session.avatarUrl || session.discordAvatar;
  const initial = (
    session.displayName ||
    session.discordUsername ||
    "?"
  )[0].toUpperCase();

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-white/[0.04] transition-colors cursor-pointer border border-transparent hover:border-white/[0.08]"
      >
        <div className="w-7 h-7 rounded-full overflow-hidden border border-white/10">
          {avatar ? (
            <img src={avatar} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-violet-500/20 text-violet-400 text-xs font-bold">
              {initial}
            </div>
          )}
        </div>
        <div className="hidden sm:flex items-center gap-1.5">
          <span className="text-xs font-medium text-zinc-300 max-w-[80px] truncate">
            {session.displayName || session.discordUsername}
          </span>
          <Gem className="w-3 h-3 text-cyan-400" />
          <span className="text-xs font-mono font-bold text-cyan-400">
            {session.diamonds}
          </span>
        </div>
        <ChevronDown
          className={cn(
            "w-3 h-3 text-zinc-500 transition-transform",
            isOpen && "rotate-180"
          )}
        />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-56 glass-card shadow-2xl z-50 overflow-hidden border border-white/[0.1]">
            {/* User Info */}
            <div className="p-4 border-b border-white/[0.06] flex items-center gap-3">
              <div className="w-10 h-10 rounded-full overflow-hidden border border-white/10">
                {avatar ? (
                  <img
                    src={avatar}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-violet-500/20 text-violet-400 text-sm font-bold">
                    {initial}
                  </div>
                )}
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-zinc-200">
                  {session.displayName || session.discordUsername}
                </span>
                <span className="text-[10px] text-zinc-500 font-mono">
                  @{session.discordUsername}
                </span>
              </div>
            </div>

            {/* Diamond Balance */}
            <div className="px-4 py-3 border-b border-white/[0.06] bg-cyan-500/[0.03]">
              <div className="flex items-center gap-2">
                <Gem className="w-4 h-4 text-cyan-400" />
                <span className="text-sm font-mono font-bold text-cyan-400">
                  {session.diamonds.toLocaleString()}
                </span>
                <span className="text-[10px] text-zinc-500 font-mono">
                  Kim Cương
                </span>
              </div>
            </div>

            {/* Menu Items */}
            <div className="py-1">
              <Link
                href="/profile"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 text-xs font-medium text-zinc-300 hover:bg-white/[0.04] transition-colors"
              >
                <User className="w-3.5 h-3.5 text-zinc-500" />
                Hồ Sơ Của Tôi
              </Link>
              <Link
                href="/shop"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 text-xs font-medium text-zinc-300 hover:bg-white/[0.04] transition-colors"
              >
                <ShoppingBag className="w-3.5 h-3.5 text-zinc-500" />
                Cửa Hàng
              </Link>
              <Link
                href={`/player/${session.playerId}`}
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 text-xs font-medium text-zinc-300 hover:bg-white/[0.04] transition-colors"
              >
                <BarChart3 className="w-3.5 h-3.5 text-zinc-500" />
                Thống Kê
              </Link>
            </div>

            {/* Logout */}
            <div className="border-t border-white/[0.06] py-1">
              <a
                href="/api/auth/logout"
                className="flex items-center gap-3 px-4 py-2.5 text-xs font-medium text-rose-400 hover:bg-rose-500/[0.06] transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                Đăng Xuất
              </a>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
