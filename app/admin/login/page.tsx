"use client";

import { useState } from "react";
import Link from "next/link";
import { loginAdminAction } from "../../lib/actions";
import { Shield, Lock, Loader2, ArrowLeft, Sparkles } from "lucide-react";

export default function AdminLoginPage() {
  const [passcode, setPasscode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passcode) return;

    setIsSubmitting(true);
    setErrorMsg(null);

    const result = await loginAdminAction(passcode);
    setIsSubmitting(false);

    if (result.success) {
      window.location.href = "/admin";
    } else {
      setErrorMsg(result.error || "Mật mã không đúng. Vui lòng thử lại!");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0a0a0f] relative overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-md p-4">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center justify-center gap-2.5 mb-8"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <span className="text-lg font-bold text-white">TFT LOBBY</span>
          <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-violet-500/20 text-violet-400 border border-violet-500/30">
            PRO
          </span>
        </Link>

        {/* Login Card */}
        <div className="glass-card p-8 flex flex-col gap-6">
          <div className="flex flex-col items-center text-center gap-3">
            <div className="w-14 h-14 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
              <Shield className="w-7 h-7 text-amber-400" />
            </div>
            <div className="flex flex-col gap-1">
              <h1 className="text-lg font-bold text-white">Admin Login</h1>
              <p className="text-xs text-zinc-500 font-mono">
                Hệ Thống Giải Đấu Đấu Trường Chân Lý
              </p>
            </div>
          </div>

          <div className="h-px bg-white/[0.06]" />

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <label className="text-[10px] text-zinc-500 font-mono uppercase font-bold tracking-wider">
                Mật mã quản trị viên
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input
                  type="password"
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                  placeholder="Nhập mật mã..."
                  required
                  disabled={isSubmitting}
                  className="w-full bg-white/[0.03] border border-white/[0.08] rounded-lg pl-10 pr-4 py-2.5 text-center font-mono text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-violet-500/50 transition-colors"
                />
              </div>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20 text-xs font-mono text-center">
                ⚠ {errorMsg}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting || !passcode}
              className="w-full py-2.5 bg-gradient-to-r from-violet-600 to-violet-500 hover:from-violet-500 hover:to-violet-400 text-white font-bold text-sm rounded-lg transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2 neon-glow"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Đang xác thực...
                </>
              ) : (
                "Xác Thực Quyền Admin"
              )}
            </button>
          </form>

          <div className="text-center font-mono text-xs pt-2 border-t border-white/[0.06]">
            <Link
              href="/"
              className="text-zinc-500 hover:text-zinc-300 transition-colors inline-flex items-center gap-1"
            >
              <ArrowLeft className="w-3 h-3" />
              Quay lại Trang Chủ
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
