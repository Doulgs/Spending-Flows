"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeftRight, CreditCard, LayoutDashboard, Menu } from "lucide-react";
import { useSidebar } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

const ITEMS = [
  { label: "Início", href: "/dashboard", icon: LayoutDashboard },
  { label: "Lançamentos", href: "/transactions", icon: ArrowLeftRight },
  { label: "Carteira", href: "/accounts", icon: CreditCard },
] as const;

export function MobileBottomNav() {
  const pathname = usePathname();
  const { toggleSidebar } = useSidebar();
  return (
    <nav className="fixed inset-x-3 bottom-3 z-30 grid h-16 grid-cols-4 rounded-2xl border border-border bg-surface-elevated p-1.5 shadow-2xl shadow-black md:hidden" aria-label="Navegação principal">
      {ITEMS.map((item) => {
        const Icon = item.icon;
        const active = pathname === item.href || pathname.startsWith(`${item.href}/`) || (item.href === "/accounts" && pathname === "/cards");
        return <Link key={item.href} href={item.href} className={cn("flex min-w-0 flex-col items-center justify-center gap-1 rounded-xl text-[10px] font-medium text-text-muted", active && "bg-primary-subtle text-primary")}><Icon className="size-4"/><span className="truncate">{item.label}</span></Link>;
      })}
      <button type="button" onClick={toggleSidebar} className="flex min-w-0 flex-col items-center justify-center gap-1 rounded-xl text-[10px] font-medium text-text-muted"><Menu className="size-4"/><span>Menu</span></button>
    </nav>
  );
}
