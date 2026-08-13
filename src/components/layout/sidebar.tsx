"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Calendar,
  ArrowLeftRight,
  Wallet,
  CreditCard,
  Tags,
  Repeat,
  Rss,
  LineChart,
  BarChart3,
  Radio,
  Settings,
  Wand2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { WorkspaceSwitcher } from "@/components/layout/workspace-switcher";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Calendário", href: "/calendar", icon: Calendar },
  { label: "Transações", href: "/transactions", icon: ArrowLeftRight },
  { label: "Contas", href: "/accounts", icon: Wallet },
  { label: "Cartões", href: "/cards", icon: CreditCard },
  { label: "Categorias", href: "/categories", icon: Tags },
  { label: "Recorrências", href: "/recurrences", icon: Repeat },
  { label: "Assinaturas", href: "/subscriptions", icon: Rss },
  { label: "Fluxo de Caixa", href: "/cash-flow", icon: LineChart },
  { label: "Relatórios", href: "/reports", icon: BarChart3 },
  { label: "Canais", href: "/channels", icon: Radio },
  { label: "Configurações", href: "/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden h-screen w-[240px] shrink-0 flex-col border-r border-border/50 bg-background-secondary md:flex">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary/30 to-primary/10 ring-1 ring-primary/20 text-primary shadow-lg shadow-primary/10">
          <Wand2 className="h-5 w-5" />
        </div>
        <div>
          <span className="text-sm font-bold text-text-primary tracking-wide">Spending</span>
          <span className="text-sm font-bold text-primary tracking-wide"> Flows</span>
        </div>
      </div>

      <div className="px-4 pb-4">
        <WorkspaceSwitcher />
      </div>

      <div className="px-4 pb-2">
        <p className="px-2 text-[10px] font-semibold uppercase tracking-widest text-text-muted/60">Menu</p>
      </div>

      <nav className="scrollbar-thin flex-1 overflow-y-auto px-4 pb-6">
        <ul className="space-y-0.5">
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href || pathname?.startsWith(item.href + "/");
            const Icon = item.icon;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150",
                    active
                      ? "bg-primary/15 text-primary shadow-sm shadow-primary/5 ring-1 ring-primary/10"
                      : "text-text-muted hover:bg-surface-elevated/60 hover:text-text-primary"
                  )}
                >
                  <span className={cn(
                    "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition-all",
                    active
                      ? "bg-primary/20 text-primary"
                      : "text-text-muted group-hover:text-text-primary"
                  )}>
                    <Icon className="h-4 w-4" />
                  </span>
                  {item.label}
                  {active && (
                    <span className="ml-auto h-1.5 w-1.5 rounded-full bg-primary" />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-4 border-t border-border/50">
        <div className="rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 p-3 ring-1 ring-primary/10">
          <p className="text-xs font-semibold text-text-primary">Spending Flows</p>
          <p className="mt-0.5 text-[11px] text-text-muted">Gestão financeira inteligente</p>
        </div>
      </div>
    </aside>
  );
}
