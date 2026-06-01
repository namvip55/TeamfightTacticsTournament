import { Gem } from "lucide-react";
import { cn } from "@/lib/utils";

interface DiamondDisplayProps {
  amount: number;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  className?: string;
}

export default function DiamondDisplay({
  amount,
  size = "md",
  showLabel = true,
  className,
}: DiamondDisplayProps) {
  const sizeMap = {
    sm: { icon: "w-3.5 h-3.5", text: "text-sm", label: "text-[9px]" },
    md: { icon: "w-4 h-4", text: "text-base", label: "text-[10px]" },
    lg: { icon: "w-5 h-5", text: "text-xl", label: "text-xs" },
  };

  const s = sizeMap[size];

  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      <Gem className={cn(s.icon, "text-cyan-400")} />
      <span className={cn(s.text, "font-mono font-bold text-cyan-400")}>
        {amount.toLocaleString()}
      </span>
      {showLabel && (
        <span className={cn(s.label, "text-zinc-500 font-mono")}>KC</span>
      )}
    </div>
  );
}
