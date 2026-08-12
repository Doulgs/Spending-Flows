"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useWorkspaceStore } from "@/stores/workspace-store";
import type { WorkspaceOption } from "@/types";

export function useWorkspaces() {
  const { workspaces, setWorkspaces, currentWorkspaceId, setCurrentWorkspaceId, currentWorkspace } =
    useWorkspaceStore();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
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
          .select("id, name, type, currency")
          .order("created_at", { ascending: true });
        if (fetchError) throw fetchError;
        if (active) {
          setWorkspaces((data as WorkspaceOption[]) ?? []);
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
  }, [setWorkspaces]);

  return {
    workspaces,
    currentWorkspaceId,
    setCurrentWorkspaceId,
    currentWorkspace: currentWorkspace(),
    loading,
    error,
  };
}
