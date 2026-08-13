import Image from "next/image";
import { cn } from "@/lib/utils";

export function AppBrand({ compact = false, className }: { compact?: boolean; className?: string }) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <Image src="/favicon/apple-touch-icon.png" width={compact ? 36 : 42} height={compact ? 36 : 42} alt="Símbolo do Spending Flows" className="rounded-xl shadow-lg shadow-black/30" priority />
      {!compact && <div className="leading-none"><p className="text-[15px] font-bold tracking-[-0.02em] text-text-primary">Spending Flows</p><p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-text-muted">Finance OS</p></div>}
    </div>
  );
}
