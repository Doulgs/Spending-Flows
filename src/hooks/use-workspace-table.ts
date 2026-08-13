"use client";
import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useWorkspaceStore } from "@/stores/workspace-store";
import type { Database } from "@/types/database";

type PublicTables = Database["public"]["Tables"];
type WorkspaceScopedTable = {
  [Table in keyof PublicTables]: "workspace_id" extends keyof PublicTables[Table]["Row"] ? Table : never
}[keyof PublicTables];

interface UseWorkspaceTableOptions {
  select?: string;
  orderBy?: { column: string; ascending?: boolean };
}

export function useWorkspaceTable<T = Record<string, unknown>>(
  table: WorkspaceScopedTable,
  options: UseWorkspaceTableOptions = {}
) {
  const workspaceId = useWorkspaceStore((s) => s.currentWorkspaceId);
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!workspaceId) {
      setData([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const supabase = createClient();
      let query = supabase
        .from(table)
        .select(options.select ?? "*")
        .eq("workspace_id", workspaceId);
      if (options.orderBy) {
        query = query.order(options.orderBy.column, {
          ascending: options.orderBy.ascending ?? true,
        });
      }
      const { data: rows, error: fetchError } = await query;
      if (fetchError) throw fetchError;
      setData((rows as T[]) ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível carregar os dados.");
      setData([]);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [table, workspaceId, options.select, options.orderBy?.column, options.orderBy?.ascending]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { data, loading, error, refresh };
}
