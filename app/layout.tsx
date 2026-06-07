import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { TooltipProvider } from "@/components/ui/tooltip";
import "./globals.css";

const interSans = Inter({
  variable: "--font-sans",
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "TFT Tournaments | Hệ thống Giải đấu Đấu Trường Chân Lý",
  description:
    "Trang thông tin giải đấu TFT, bảng xếp hạng realtime, quản lý lobbies và thống kê chi tiết tuyển thủ đồng bộ với Discord Bot.",
  keywords: [
    "TFT",
    "Teamfight Tactics",
    "Đấu Trường Chân Lý",
    "Tournament",
    "Discord Bot",
    "Riot Games",
    "Rankings",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className={`${interSans.variable} dark`}>
      <body className="min-h-screen bg-[#0a0a0f] text-[#e4e4e7] font-sans antialiased">
        <TooltipProvider delayDuration={200}>
          {children}
          <footer className="mt-auto border-t border-white/[0.04] py-4 px-6 text-center">
            <p className="text-[10px] text-zinc-600 font-mono leading-relaxed max-w-3xl mx-auto">
              TFT Tournaments không được chứng thực bởi Riot Games và không phản ánh quan điểm hay ý kiến của Riot Games hoặc bất kỳ ai tham gia chính thức vào việc sản xuất hay quản lý Riot Games.
              Riot Games và mọi tài sản liên quan là thương hiệu hoặc thương hiệu đã đăng ký của Riot Games, Inc.
            </p>
          </footer>
        </TooltipProvider>
      </body>
    </html>
  );
}
