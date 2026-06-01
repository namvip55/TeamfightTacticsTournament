"use client";

import { useState } from "react";
import { purchaseItemAction } from "../lib/player-actions";
import { cn } from "@/lib/utils";
import {
  Gem,
  ShoppingBag,
  Loader2,
  CheckCircle2,
  XCircle,
  History,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

interface ShopItem {
  id: string;
  name: string;
  description: string | null;
  price: number;
  item_type: string;
  item_data: Record<string, any>;
  stock: number | null;
}

interface Purchase {
  id: string;
  diamonds_spent: number;
  created_at: string;
  shop_items?: { name: string; item_type: string } | null;
}

interface ShopClientProps {
  items: ShopItem[];
  playerDiamonds: number;
  purchases: Purchase[];
}

const ITEM_TYPE_ICONS: Record<string, string> = {
  discord_role: "🎭",
  badge: "🏅",
  custom_title: "✨",
};

export default function ShopClient({
  items,
  playerDiamonds,
  purchases,
}: ShopClientProps) {
  const [diamonds, setDiamonds] = useState(playerDiamonds);
  const [purchasingId, setPurchasingId] = useState<string | null>(null);
  const [message, setMessage] = useState<{
    text: string;
    type: "success" | "error";
  } | null>(null);
  const [confirmItem, setConfirmItem] = useState<ShopItem | null>(null);

  const handlePurchase = async (item: ShopItem) => {
    setPurchasingId(item.id);
    setMessage(null);
    setConfirmItem(null);

    const result = await purchaseItemAction(item.id);

    setPurchasingId(null);

    if (result.success) {
      setDiamonds(result.newBalance!);
      setMessage({
        text: `Đã đổi thành công "${result.itemName}"!`,
        type: "success",
      });
    } else {
      setMessage({ text: result.error || "Lỗi mua hàng", type: "error" });
    }
  };

  return (
    <>
      {/* Messages */}
      {message && (
        <div
          className={cn(
            "p-4 rounded-lg border text-xs font-mono flex items-center gap-2",
            message.type === "success"
              ? "bg-green-500/10 text-green-400 border-green-500/20"
              : "bg-rose-500/10 text-rose-400 border-rose-500/20"
          )}
        >
          {message.type === "success" ? (
            <CheckCircle2 className="w-4 h-4" />
          ) : (
            <XCircle className="w-4 h-4" />
          )}
          <span>{message.text}</span>
          <button
            onClick={() => setMessage(null)}
            className="ml-auto text-zinc-500 hover:text-zinc-300 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Items Grid */}
      {items.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item) => {
            const canAfford = diamonds >= item.price;
            const outOfStock = item.stock !== null && item.stock <= 0;
            const isPurchasing = purchasingId === item.id;

            return (
              <div
                key={item.id}
                className="glass-card p-5 flex flex-col gap-3"
              >
                <div className="flex items-start justify-between">
                  <span className="text-2xl">
                    {ITEM_TYPE_ICONS[item.item_type] || "🎁"}
                  </span>
                  <div className="flex items-center gap-1">
                    <Gem className="w-4 h-4 text-cyan-400" />
                    <span className="text-lg font-mono font-bold text-cyan-400">
                      {item.price}
                    </span>
                  </div>
                </div>

                <div>
                  <h3 className="text-base font-semibold text-white">
                    {item.name}
                  </h3>
                  {item.description && (
                    <p className="text-xs text-zinc-500 font-mono mt-1">
                      {item.description}
                    </p>
                  )}
                </div>

                {item.stock !== null && (
                  <div className="text-[10px] font-mono text-zinc-500">
                    Còn lại:{" "}
                    <span className="font-bold text-zinc-300">
                      {item.stock}
                    </span>
                  </div>
                )}

                {outOfStock ? (
                  <button
                    disabled
                    className="w-full py-2 bg-zinc-500/10 text-zinc-500 text-xs font-mono font-bold rounded-lg cursor-not-allowed"
                  >
                    Hết Hàng
                  </button>
                ) : !canAfford ? (
                  <button
                    disabled
                    className="w-full py-2 bg-rose-500/10 text-rose-400 text-xs font-mono font-bold rounded-lg cursor-not-allowed"
                  >
                    Không Đủ Kim Cương
                  </button>
                ) : (
                  <button
                    onClick={() => setConfirmItem(item)}
                    disabled={isPurchasing}
                    className="w-full py-2 bg-gradient-to-r from-violet-600 to-violet-500 hover:from-violet-500 hover:to-violet-400 text-white text-xs font-mono font-bold rounded-lg transition-all cursor-pointer disabled:opacity-50"
                  >
                    {isPurchasing ? "Đang xử lý..." : "Đổi Ngay"}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="glass-card p-16 text-center">
          <ShoppingBag className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
          <p className="text-lg text-zinc-400">Cửa hàng chưa có vật phẩm.</p>
          <p className="text-xs font-mono text-zinc-600 mt-2">
            Hãy quay lại sau!
          </p>
        </div>
      )}

      {/* Purchase History */}
      {purchases.length > 0 && (
        <div className="mt-8">
          <h2 className="text-sm font-mono font-bold text-zinc-400 uppercase tracking-wider mb-4 flex items-center gap-2">
            <History className="w-4 h-4 text-violet-400" />
            Lịch Sử Đổi Thưởng
          </h2>
          <div className="glass-card overflow-hidden">
            <div className="divide-y divide-white/[0.03]">
              {purchases.map((p) => (
                <div
                  key={p.id}
                  className="px-4 py-3 flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm">
                      {ITEM_TYPE_ICONS[p.shop_items?.item_type || ""] || "🎁"}
                    </span>
                    <div>
                      <span className="text-sm font-mono text-zinc-200">
                        {p.shop_items?.name}
                      </span>
                      <span className="text-[10px] text-zinc-500 font-mono ml-2">
                        {new Date(p.created_at).toLocaleDateString("vi-VN")}
                      </span>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-bold text-rose-400 flex items-center gap-1">
                    <Gem className="w-3 h-3" />-{p.diamonds_spent}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Confirm Dialog */}
      <Dialog
        open={!!confirmItem}
        onOpenChange={() => setConfirmItem(null)}
      >
        <DialogContent className="bg-[#141420] border-white/[0.08]">
          <DialogHeader>
            <DialogTitle className="text-white">Xác Nhận Đổi</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-zinc-400 font-mono">
            Đổi{" "}
            <strong className="text-white">{confirmItem?.name}</strong> với{" "}
            <strong className="text-cyan-400 flex inline-flex items-center gap-1">
              <Gem className="w-3 h-3" />
              {confirmItem?.price} kim cương
            </strong>
            ?
          </p>
          <DialogFooter>
            <button
              onClick={() => confirmItem && handlePurchase(confirmItem)}
              className="flex-1 py-2.5 bg-gradient-to-r from-violet-600 to-violet-500 text-white text-sm font-mono font-bold rounded-lg transition-colors cursor-pointer"
            >
              Xác Nhận
            </button>
            <button
              onClick={() => setConfirmItem(null)}
              className="flex-1 py-2.5 bg-white/[0.04] border border-white/[0.08] text-zinc-400 hover:text-zinc-200 text-sm font-mono font-bold rounded-lg transition-colors cursor-pointer"
            >
              Hủy
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
