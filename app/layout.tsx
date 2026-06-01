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
        <TooltipProvider delayDuration={200}>{children}</TooltipProvider>
      </body>
    </html>
  );
}
