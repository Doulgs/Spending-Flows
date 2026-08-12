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
        <button className="flex w-full items-center gap-2 rounded-md border border-border bg-surface px-3 py-2 text-left text-sm hover:border-border-strong">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary/15 text-primary">
            <Building2 className="h-4 w-4" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate font-medium text-text-primary">
              {loading ? "Carregando..." : currentWorkspace?.name ?? "Sem workspace"}
            </p>
            <p className="truncate text-xs text-text-muted">
              {currentWorkspace?.currency ?? "—"}
            </p>
          </div>
          <ChevronsUpDown className="h-4 w-4 shrink-0 text-text-muted" />
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
