"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, ChevronDown, LogOut, Menu, Plus, Search } from "lucide-react";
import { NAV_ITEMS } from "@/components/layout/navigation";
import { SidebarContent } from "@/components/layout/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandShortcut } from "@/components/ui/command";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { signOut } from "@/features/auth/actions";
import { useCurrentUser } from "@/hooks/use-current-user";
import { useUIStore } from "@/stores/ui-store";
import { useWorkspaceStore } from "@/stores/workspace-store";

export function Header({ title }: { title: string }) {
  const router = useRouter();
  const openQuickAdd = useUIStore((state) => state.openQuickAdd);
  const currentWorkspaceId = useWorkspaceStore((state) => state.currentWorkspaceId);
  const workspaces = useWorkspaceStore((state) => state.workspaces);
  const currentWorkspace = workspaces.find((workspace) => workspace.id === currentWorkspaceId);
  const { displayName, avatarUrl, initials, user } = useCurrentUser();
  const [commandOpen, setCommandOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") { event.preventDefault(); setCommandOpen((open) => !open); }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const navigate = (href: string) => { setCommandOpen(false); router.push(href); };

  return <>
    <header className="sticky top-0 z-30 flex min-h-[76px] items-center gap-4 border-b border-border-subtle bg-background px-4 sm:px-6 lg:px-8">
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setMobileOpen(true)} aria-label="Abrir menu"><Menu className="h-5 w-5" /></Button>
        <SheetContent side="left" className="w-[286px] border-border-subtle bg-background-secondary p-0"><SidebarContent onNavigate={() => setMobileOpen(false)} /></SheetContent>
      </Sheet>
      <div className="min-w-0 lg:w-[240px]"><p className="truncate text-lg font-bold tracking-[-0.02em] text-text-primary">{title}</p><p className="truncate text-xs text-text-muted">{currentWorkspace?.name ?? `Olá, ${displayName}`}</p></div>
      <button type="button" onClick={() => setCommandOpen(true)} className="mx-auto hidden h-11 w-full max-w-md items-center gap-3 rounded-xl border border-border bg-surface px-4 text-left text-sm text-text-muted transition-colors hover:border-border-strong hover:bg-surface-elevated md:flex"><Search className="h-4 w-4" /><span className="flex-1">Buscar uma página...</span><kbd className="rounded-md border border-border bg-background px-2 py-1 text-[10px] font-semibold">⌘ K</kbd></button>
      <div className="ml-auto flex items-center gap-2">
        <DropdownMenu><DropdownMenuTrigger asChild><Button size="sm" className="hidden gap-2 sm:inline-flex"><Plus className="h-4 w-4" /> Novo</Button></DropdownMenuTrigger><DropdownMenuContent align="end" className="w-48"><DropdownMenuItem onClick={() => openQuickAdd("expense")}>Nova despesa</DropdownMenuItem><DropdownMenuItem onClick={() => openQuickAdd("income")}>Nova receita</DropdownMenuItem><DropdownMenuItem onClick={() => openQuickAdd("transfer")}>Nova transferência</DropdownMenuItem></DropdownMenuContent></DropdownMenu>
        <Button variant="ghost" size="icon" className="relative border border-border bg-surface" aria-label="Notificações"><Bell className="h-4 w-4" /><span className="absolute right-2.5 top-2.5 h-1.5 w-1.5 rounded-full bg-primary" /></Button>
        <DropdownMenu><DropdownMenuTrigger className="flex items-center gap-2 rounded-xl p-1.5 outline-none transition-colors hover:bg-surface-elevated"><Avatar className="h-8 w-8 border border-primary-border"><AvatarImage src={avatarUrl} alt="" /><AvatarFallback className="bg-primary-subtle text-xs font-bold text-primary">{initials}</AvatarFallback></Avatar><ChevronDown className="hidden h-3.5 w-3.5 text-text-muted sm:block" /></DropdownMenuTrigger><DropdownMenuContent align="end" className="w-60"><div className="px-3 py-2"><p className="truncate text-sm font-semibold">{displayName}</p><p className="truncate text-xs text-text-muted">{user?.email}</p></div><DropdownMenuSeparator /><DropdownMenuItem onClick={() => router.push("/settings")}>Configurações</DropdownMenuItem><DropdownMenuItem onClick={() => signOut()} className="text-destructive"><LogOut className="mr-2 h-4 w-4" /> Sair da conta</DropdownMenuItem></DropdownMenuContent></DropdownMenu>
      </div>
    </header>
    <CommandDialog open={commandOpen} onOpenChange={setCommandOpen}><CommandInput placeholder="Digite o nome de uma página..." /><CommandList><CommandEmpty>Nenhuma página encontrada.</CommandEmpty><CommandGroup heading="Navegação">{NAV_ITEMS.map((item) => { const Icon = item.icon; return <CommandItem key={item.href} value={item.label} onSelect={() => navigate(item.href)}><Icon className="mr-3 h-4 w-4 text-text-muted" />{item.label}<CommandShortcut>Ir</CommandShortcut></CommandItem>; })}</CommandGroup></CommandList></CommandDialog>
  </>;
}
