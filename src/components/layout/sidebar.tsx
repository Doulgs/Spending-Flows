"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut } from "lucide-react";
import { AppBrand } from "@/components/layout/app-brand";
import { ANALYSIS_NAV_ITEMS, PRIMARY_NAV_ITEMS, SETTINGS_NAV_ITEM } from "@/components/layout/navigation";
import { WorkspaceSwitcher } from "@/components/layout/workspace-switcher";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { signOut } from "@/features/auth/actions";
import { useCurrentUser } from "@/hooks/use-current-user";
import { cn } from "@/lib/utils";

function NavGroup({ label, items, onNavigate }: { label: string; items: readonly { label: string; href: string; icon: React.ComponentType<{ className?: string }> }[]; onNavigate?: () => void }) {
  const pathname = usePathname();
  return <div><p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-text-muted">{label}</p><ul className="space-y-1">{items.map((item) => {
    const active = pathname === item.href || pathname?.startsWith(`${item.href}/`);
    const Icon = item.icon;
    return <li key={item.href}><Link href={item.href} onClick={onNavigate} className={cn("group flex min-h-10 items-center gap-3 rounded-xl px-3 text-sm font-medium transition-all", active ? "bg-primary text-primary-foreground shadow-lg shadow-black/20" : "text-text-secondary hover:bg-surface-elevated hover:text-text-primary")}><Icon className={cn("h-[18px] w-[18px]", !active && "text-text-muted group-hover:text-text-primary")} /><span>{item.label}</span></Link></li>;
  })}</ul></div>;
}

export function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const { displayName, avatarUrl, initials, user } = useCurrentUser();
  return <div className="flex h-full min-h-0 flex-col bg-background-secondary">
    <div className="px-5 pb-5 pt-6"><AppBrand /></div>
    <div className="px-4 pb-5"><WorkspaceSwitcher /></div>
    <nav className="scrollbar-thin flex-1 space-y-6 overflow-y-auto px-4 pb-5"><NavGroup label="Organização" items={PRIMARY_NAV_ITEMS} onNavigate={onNavigate} /><NavGroup label="Análise" items={ANALYSIS_NAV_ITEMS} onNavigate={onNavigate} /></nav>
    <div className="border-t border-border-subtle p-4"><NavGroup label="Preferências" items={[SETTINGS_NAV_ITEM]} onNavigate={onNavigate} />
      <div className="mt-4 flex items-center gap-3 rounded-xl border border-border-subtle bg-surface px-3 py-3"><Avatar className="h-9 w-9 border border-border"><AvatarImage src={avatarUrl} alt="" /><AvatarFallback className="bg-primary-subtle text-xs font-bold text-primary">{initials}</AvatarFallback></Avatar><div className="min-w-0 flex-1"><p className="truncate text-xs font-semibold text-text-primary">{displayName}</p><p className="truncate text-[10px] text-text-muted">{user?.email ?? "Conta Spending Flows"}</p></div><button type="button" onClick={() => signOut()} className="rounded-lg p-2 text-text-muted transition-colors hover:bg-surface-hover hover:text-text-primary" aria-label="Sair da conta"><LogOut className="h-4 w-4" /></button></div>
    </div>
  </div>;
}

export function Sidebar() { return <aside className="hidden h-screen w-[260px] shrink-0 border-r border-border-subtle lg:block"><SidebarContent /></aside>; }
