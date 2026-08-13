"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useWorkspaceStore } from "@/stores/workspace-store";
import type { WorkspaceOption } from "@/types";

export function useWorkspaces() {
  const { workspaces, setWorkspaces, currentWorkspaceId, setCurrentWorkspaceId, currentWorkspace, hasHydrated } =
    useWorkspaceStore();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!hasHydrated) return;

    let active = true;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) {
          if (active) setLoading(false);
          return;
        }
        const { data, error: fetchError } = await supabase
          .from("workspaces")
          .select("id, owner_id, name, type, currency, accent_color")
          .order("created_at", { ascending: true });
        if (fetchError) throw fetchError;
        if (active) {
          const nextWorkspaces = (data as WorkspaceOption[]) ?? [];
          setWorkspaces(nextWorkspaces);
          const invitedWorkspaceId = localStorage.getItem("spending-flows-invited-workspace");
          if (invitedWorkspaceId && nextWorkspaces.some((workspace) => workspace.id === invitedWorkspaceId)) {
            setCurrentWorkspaceId(invitedWorkspaceId);
            localStorage.removeItem("spending-flows-invited-workspace");
          }
        }
      } catch (err) {
        if (active) setError(err instanceof Error ? err.message : "Erro ao carregar workspaces");
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => {
      active = false;
    };
  }, [hasHydrated, setCurrentWorkspaceId, setWorkspaces]);

  return {
    workspaces,
    currentWorkspaceId,
    setCurrentWorkspaceId,
    currentWorkspace: currentWorkspace(),
    loading,
    error,
  };
}
