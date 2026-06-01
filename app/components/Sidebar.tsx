"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Trophy,
  Users,
  ShoppingBag,
  Shield,
  Menu,
  X,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  session: {
    playerId: string;
    discordUsername: string;
    displayName: string | null;
    avatarUrl: string | null;
    diamonds: number;
  } | null;
  children: React.ReactNode;
}

const navItems = [
  { href: "/", label: "Trang Chủ", icon: Home },
  { href: "/players", label: "Tuyển Thủ", icon: Users },
  { href: "/shop", label: "Cửa Hàng", icon: ShoppingBag },
];

export default function Sidebar({ session, children }: SidebarProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <div className="flex min-h-screen">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 border-r border-white/[0.08] bg-[#0d0d14] fixed inset-y-0 z-40">
        {/* Logo */}
        <div className="h-16 flex items-center px-6 border-b border-white/[0.08]">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-bold tracking-wide text-white">
                TFT LOBBY
              </span>
              <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-violet-500/20 text-violet-400 border border-violet-500/30">
                PRO
              </span>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                  active
                    ? "bg-violet-500/10 text-violet-400 border border-violet-500/20"
                    : "text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04] border border-transparent"
                )}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
                {active && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-violet-400 shadow-[0_0_8px_rgba(139,92,246,0.6)]" />
                )}
              </Link>
            );
          })}

          {/* Tournament links - dynamic based on current path */}
          {pathname.startsWith("/tournaments") && (
            <div className="mt-2 pt-2 border-t border-white/[0.06]">
              <span className="px-3 text-[10px] font-mono text-zinc-500 uppercase tracking-wider">
                Giải Đấu
              </span>
            </div>
          )}
        </nav>

        {/* Bottom section */}
        <div className="px-3 pb-4 flex flex-col gap-2">
          {/* Player info or Login */}
          {session ? (
            <Link
              href="/profile"
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 border",
                pathname === "/profile"
                  ? "bg-violet-500/10 border-violet-500/20"
                  : "border-transparent hover:bg-white/[0.04]"
              )}
            >
              <div className="w-8 h-8 rounded-full overflow-hidden border border-white/10">
                {session.avatarUrl ? (
                  <img
                    src={session.avatarUrl}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-violet-500/20 text-violet-400 text-xs font-bold">
                    {(session.displayName || session.discordUsername || "?")[0].toUpperCase()}
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-sm font-medium text-zinc-200 truncate block">
                  {session.displayName || session.discordUsername}
                </span>
                <span className="text-[10px] font-mono text-cyan-400">
                  💎 {session.diamonds}
                </span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-zinc-500" />
            </Link>
          ) : (
            <a
              href="/api/auth/login"
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-[#5865F2]/10 border border-[#5865F2]/20 text-[#5865F2] hover:bg-[#5865F2]/20 transition-all duration-200"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189z" />
              </svg>
              <span className="text-sm font-medium">Đăng nhập Discord</span>
            </a>
          )}

          {/* Admin link */}
          <Link
            href="/admin"
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 border",
              pathname.startsWith("/admin")
                ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                : "text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.04] border-transparent"
            )}
          >
            <Shield className="w-4 h-4" />
            <span>Admin</span>
          </Link>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 inset-x-0 z-50 h-14 bg-[#0d0d14]/90 backdrop-blur-xl border-b border-white/[0.08] flex items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center">
            <Sparkles className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="text-sm font-bold text-white">TFT LOBBY</span>
          <span className="text-[8px] font-mono font-bold px-1 py-0.5 rounded bg-violet-500/20 text-violet-400">
            PRO
          </span>
        </Link>

        <div className="flex items-center gap-2">
          {session && (
            <Link href="/profile" className="flex items-center gap-1.5">
              <span className="text-[10px] font-mono text-cyan-400">
                💎 {session.diamonds}
              </span>
              <div className="w-7 h-7 rounded-full overflow-hidden border border-white/10">
                {session.avatarUrl ? (
                  <img src={session.avatarUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-violet-500/20 text-violet-400 text-xs font-bold">
                    {(session.displayName || session.discordUsername || "?")[0].toUpperCase()}
                  </div>
                )}
              </div>
            </Link>
          )}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-2 text-zinc-400 hover:text-white transition-colors"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileOpen && (
        <>
          <div
            className="lg:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <div className="lg:hidden fixed top-14 inset-x-0 z-50 bg-[#0d0d14] border-b border-white/[0.08] p-4 flex flex-col gap-1">
            {[...navItems, { href: "/admin", label: "Admin", icon: Shield }].map(
              (item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all",
                      active
                        ? "bg-violet-500/10 text-violet-400"
                        : "text-zinc-400 hover:text-white hover:bg-white/[0.04]"
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </Link>
                );
              }
            )}
            {!session && (
              <a
                href="/api/auth/login"
                className="flex items-center gap-3 px-4 py-3 rounded-lg bg-[#5865F2]/10 text-[#5865F2] text-sm font-medium mt-2"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189z" />
                </svg>
                Đăng nhập Discord
              </a>
            )}
          </div>
        </>
      )}

      {/* Main Content */}
      <main className="flex-1 lg:ml-64 pt-14 lg:pt-0 min-h-screen">
        {children}
      </main>
    </div>
  );
}
