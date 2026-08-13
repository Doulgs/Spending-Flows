import {
  ArrowLeftRight, Calendar, CreditCard, LayoutDashboard, LineChart,
  Radio, Repeat, Settings, Tags, UsersRound,
} from "lucide-react";

export const PRIMARY_NAV_ITEMS = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Calendário", href: "/calendar", icon: Calendar },
  { label: "Transações", href: "/transactions", icon: ArrowLeftRight },
  { label: "Contas e cartões", href: "/accounts", icon: CreditCard },
  { label: "Categorias", href: "/categories", icon: Tags },
  { label: "Assinaturas e recorrências", href: "/subscriptions", icon: Repeat },
  { label: "Membros", href: "/members", icon: UsersRound },
] as const;

export const ANALYSIS_NAV_ITEMS = [
  { label: "Fluxo e relatórios", href: "/cash-flow", icon: LineChart },
  { label: "Canais", href: "/channels", icon: Radio },
] as const;

export const SETTINGS_NAV_ITEM = { label: "Configurações", href: "/settings", icon: Settings } as const;
export const NAV_ITEMS = [...PRIMARY_NAV_ITEMS, ...ANALYSIS_NAV_ITEMS, SETTINGS_NAV_ITEM] as const;

const NAV_ALIASES = [
  { label: "Cartões", href: "/cards" },
  { label: "Relatórios", href: "/reports" },
  { label: "Recorrências", href: "/recurrences" },
] as const;

export function getPageTitle(pathname?: string | null) {
  return [...NAV_ITEMS, ...NAV_ALIASES].find((item) => pathname === item.href || pathname?.startsWith(`${item.href}/`))?.label ?? "Spending Flows";
}
