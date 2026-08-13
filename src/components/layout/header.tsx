"use client";
import { Bell, Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useUIStore } from "@/stores/ui-store";

export function Header({ title }: { title: string }) {
  const openQuickAdd = useUIStore((s) => s.openQuickAdd);

  return (
    <header className="flex h-16 items-center justify-between border-b border-border/50 bg-background/60 px-6 backdrop-blur-md">
      <div>
        <h1 className="text-base font-semibold text-text-primary">{title}</h1>
        <p className="text-xs text-text-muted">Bem-vindo de volta</p>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden items-center gap-2 rounded-xl border border-border/60 bg-surface/60 px-3 py-2 text-sm text-text-muted md:flex">
          <Search className="h-4 w-4" />
          <span className="text-xs">Buscar...</span>
          <kbd className="ml-4 hidden rounded border border-border/80 bg-surface-elevated px-1.5 py-0.5 text-[10px] text-text-muted lg:inline-block">⌘K</kbd>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="sm" className="gap-2 rounded-xl shadow-md shadow-primary/20">
              <Plus className="h-4 w-4" /> Novo
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => openQuickAdd("expense")}>Despesa</DropdownMenuItem>
            <DropdownMenuItem onClick={() => openQuickAdd("income")}>Receita</DropdownMenuItem>
            <DropdownMenuItem onClick={() => openQuickAdd("transfer")}>Transferência</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button variant="ghost" size="icon" className="relative h-9 w-9 rounded-xl border border-border/50 bg-surface/60">
          <Bell className="h-4 w-4" />
          <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-primary ring-1 ring-background" />
        </Button>

        <Avatar className="h-9 w-9 ring-2 ring-primary/20">
          <AvatarFallback className="bg-gradient-to-br from-primary/30 to-primary/10 text-xs font-bold text-primary">SF</AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}
