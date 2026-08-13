"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, Search } from "lucide-react";
import { NAV_ITEMS } from "@/components/layout/navigation";
import { Button } from "@/components/ui/button";
import { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useWorkspaceStore } from "@/stores/workspace-store";

export function SiteHeader({ title }: { title: string }) {
  const router = useRouter();
  const workspace = useWorkspaceStore((state) => state.currentWorkspace());
  const [searchOpen, setSearchOpen] = useState(false);
  useEffect(() => { const listener = (event: KeyboardEvent) => { if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") { event.preventDefault(); setSearchOpen((value) => !value); } }; addEventListener("keydown", listener); return () => removeEventListener("keydown", listener); }, []);
  return <>
    <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-2 border-b border-border/80 bg-background/80 px-4 backdrop-blur-xl lg:px-6">
      <SidebarTrigger className="-ml-1"/><Separator orientation="vertical" className="mx-2 h-4"/><div className="min-w-0"><h1 className="truncate text-sm font-medium">{title}</h1><p className="truncate text-[10px] text-muted-foreground">{workspace?.name ?? "Workspace"}</p></div>
      <button type="button" onClick={() => setSearchOpen(true)} className="mx-auto hidden h-8 w-full max-w-xs items-center gap-2 rounded-md border border-border bg-card/70 px-3 text-left text-xs text-muted-foreground hover:bg-muted md:flex"><Search className="size-3.5"/><span className="flex-1">Buscar no sistema</span><kbd className="font-mono text-[9px]">⌘K</kbd></button>
      <div className="ml-auto flex items-center gap-1.5"><Button size="icon" variant="ghost" className="size-9"><Bell/><span className="sr-only">Notificações</span></Button></div>
    </header>
    <CommandDialog open={searchOpen} onOpenChange={setSearchOpen}><CommandInput placeholder="Encontre uma página..."/><CommandList><CommandEmpty>Nenhum resultado.</CommandEmpty><CommandGroup heading="Navegação">{NAV_ITEMS.map((item) => <CommandItem key={item.href} onSelect={() => { setSearchOpen(false); router.push(item.href); }}><item.icon className="mr-2"/>{item.label}</CommandItem>)}</CommandGroup></CommandList></CommandDialog>
  </>;
}
