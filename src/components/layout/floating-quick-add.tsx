"use client";

import { ArrowDownLeft, ArrowLeftRight, ArrowUpRight, FileSpreadsheet, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useWorkspacePermission } from "@/hooks/use-workspace-permission";
import { useUIStore } from "@/stores/ui-store";

export function FloatingQuickAdd() {
  const openQuickAdd = useUIStore((state) => state.openQuickAdd);
  const openAIImport = useUIStore((state) => state.openAIImport);
  const { canManage, loading } = useWorkspacePermission();

  if (loading || !canManage) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="icon" className="fixed bottom-20 right-4 z-40 size-14 rounded-2xl shadow-2xl shadow-black md:bottom-6 md:right-6" aria-label="Novo lançamento">
          <Plus className="size-6" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent side="top" align="end" className="mb-2 w-56 p-2">
        <DropdownMenuItem className="h-11" onClick={() => openQuickAdd("expense")}><ArrowUpRight className="mr-2 text-destructive" />Nova despesa</DropdownMenuItem>
        <DropdownMenuItem className="h-11" onClick={() => openQuickAdd("income")}><ArrowDownLeft className="mr-2 text-success" />Nova receita</DropdownMenuItem>
        <DropdownMenuItem className="h-11" onClick={() => openQuickAdd("transfer")}><ArrowLeftRight className="mr-2 text-primary" />Nova transferência</DropdownMenuItem>
        <DropdownMenuItem className="h-11 border-t border-border" onClick={openAIImport}><FileSpreadsheet className="mr-2 text-primary" />Importar com IA</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
