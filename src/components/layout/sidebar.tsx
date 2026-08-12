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
    <aside className="hidden h-screen w-64 shrink-0 flex-col border-r border-border bg-background-secondary md:flex">
      <div className="flex items-center gap-2 px-5 py-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/15 text-primary">
          <Wand2 className="h-5 w-5" />
        </div>
        <span className="text-lg font-semibold text-text-primary">Spending Flows</span>
      </div>

      <div className="px-3 pb-3">
        <WorkspaceSwitcher />
      </div>

      <nav className="scrollbar-thin flex-1 overflow-y-auto px-3 pb-6">
        <ul className="space-y-1">
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href || pathname?.startsWith(item.href + "/");
            const Icon = item.icon;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    active
                      ? "bg-primary/15 text-primary"
                      : "text-text-secondary hover:bg-surface-elevated hover:text-text-primary"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
