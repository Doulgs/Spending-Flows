"use client";
import { ChevronsUpDown, Building2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useWorkspaces } from "@/hooks/use-workspaces";

export function WorkspaceSwitcher() {
  const { workspaces, currentWorkspace, setCurrentWorkspaceId, loading } = useWorkspaces();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex w-full items-center gap-2.5 rounded-xl border border-border-subtle bg-surface px-3 py-2.5 text-left text-sm transition-all hover:border-border hover:bg-surface-elevated">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary-subtle text-primary ring-1 ring-primary-border">
            <Building2 className="h-3.5 w-3.5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-semibold text-text-primary">
              {loading ? "Carregando..." : currentWorkspace?.name ?? "Sem workspace"}
            </p>
            <p className="truncate text-[10px] text-text-muted">
              {currentWorkspace?.type === "business" ? "Negócio" : currentWorkspace?.type === "family" ? "Família" : "Pessoal"}
            </p>
          </div>
          <ChevronsUpDown className="h-3.5 w-3.5 shrink-0 text-text-muted" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="start">
        <DropdownMenuLabel>Workspaces</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {workspaces.length === 0 && (
          <div className="px-2 py-1.5 text-sm text-text-muted">Nenhum workspace encontrado</div>
        )}
        {workspaces.map((w) => (
          <DropdownMenuItem key={w.id} onClick={() => setCurrentWorkspaceId(w.id)}>
            {w.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
