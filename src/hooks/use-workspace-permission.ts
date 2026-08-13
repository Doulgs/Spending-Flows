"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useWorkspaceStore } from "@/stores/workspace-store";

export function useWorkspacePermission() {
  const workspace = useWorkspaceStore((state) => state.currentWorkspace());
  const [canManage, setCanManage] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    async function load() {
      setLoading(true);
      setCanManage(false);
      if (!workspace) { setLoading(false); return; }
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !active) { if (active) setLoading(false); return; }
      if (workspace.owner_id === user.id) { setCanManage(true); setLoading(false); return; }
      const { data } = await supabase.from("workspace_members").select("role").eq("workspace_id", workspace.id).eq("user_id", user.id).maybeSingle();
      if (active) { setCanManage(data?.role === "owner" || data?.role === "editor"); setLoading(false); }
    }
    void load();
    return () => { active = false; };
  }, [workspace]);

  return { canManage, readOnly: !canManage, loading };
}
