import {
  ArrowLeftRight, BarChart3, Calendar, CreditCard, LayoutDashboard, LineChart,
  Radio, Repeat, Rss, Settings, Tags, Wallet,
} from "lucide-react";

export const PRIMARY_NAV_ITEMS = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Calendário", href: "/calendar", icon: Calendar },
  { label: "Transações", href: "/transactions", icon: ArrowLeftRight },
  { label: "Contas", href: "/accounts", icon: Wallet },
  { label: "Cartões", href: "/cards", icon: CreditCard },
  { label: "Categorias", href: "/categories", icon: Tags },
  { label: "Recorrências", href: "/recurrences", icon: Repeat },
  { label: "Assinaturas", href: "/subscriptions", icon: Rss },
] as const;

export const ANALYSIS_NAV_ITEMS = [
  { label: "Fluxo de Caixa", href: "/cash-flow", icon: LineChart },
  { label: "Relatórios", href: "/reports", icon: BarChart3 },
  { label: "Canais", href: "/channels", icon: Radio },
] as const;

export const SETTINGS_NAV_ITEM = { label: "Configurações", href: "/settings", icon: Settings } as const;
export const NAV_ITEMS = [...PRIMARY_NAV_ITEMS, ...ANALYSIS_NAV_ITEMS, SETTINGS_NAV_ITEM] as const;

export function getPageTitle(pathname?: string | null) {
  return NAV_ITEMS.find((item) => pathname === item.href || pathname?.startsWith(`${item.href}/`))?.label ?? "Spending Flows";
}
