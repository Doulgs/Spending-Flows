"use client";
import { Bell, Plus } from "lucide-react";
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
    <header className="flex h-16 items-center justify-between border-b border-border bg-background/80 px-6 backdrop-blur">
      <h1 className="text-lg font-semibold text-text-primary">{title}</h1>
      <div className="flex items-center gap-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="sm">
              <Plus className="h-4 w-4" /> Novo
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => openQuickAdd("expense")}>Despesa</DropdownMenuItem>
            <DropdownMenuItem onClick={() => openQuickAdd("income")}>Receita</DropdownMenuItem>
            <DropdownMenuItem onClick={() => openQuickAdd("transfer")}>Transferência</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-primary" />
        </Button>

        <Avatar className="h-9 w-9">
          <AvatarFallback>SF</AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}
