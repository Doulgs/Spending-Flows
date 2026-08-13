"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export const WALLET_SECTIONS = [{ label: "Contas", href: "/accounts" }, { label: "Cartões", href: "/cards" }] as const;
export const ANALYTICS_SECTIONS = [{ label: "Fluxo de caixa", href: "/cash-flow" }, { label: "Relatórios", href: "/reports" }] as const;
export const RECURRING_SECTIONS = [{ label: "Assinaturas", href: "/subscriptions" }, { label: "Recorrências", href: "/recurrences" }] as const;

export function SectionSwitcher({ items }: { items: readonly { label: string; href: string }[] }) {
  const pathname = usePathname();
  return (
    <div className="scrollbar-none -mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
      <nav className="flex w-max min-w-full gap-1 rounded-xl border border-border bg-surface p-1" aria-label="Seções relacionadas">
        {items.map((item) => <Link key={item.href} href={item.href} className={cn("min-h-10 flex-1 whitespace-nowrap rounded-lg px-4 py-2.5 text-center text-xs font-medium text-text-muted transition-colors hover:text-text-primary", pathname === item.href && "bg-surface-elevated text-text-primary shadow-sm")}>{item.label}</Link>)}
      </nav>
    </div>
  );
}
