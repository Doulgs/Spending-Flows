import "server-only";
import { createClient } from "@/lib/supabase/server";

export async function requireWorkspaceAccess(workspaceId: string, ownerOnly = false) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Não autenticado", status: 401 } as const;

  const { data: workspace } = await supabase
    .from("workspaces")
    .select("id, owner_id, currency")
    .eq("id", workspaceId)
    .maybeSingle();
  if (!workspace) return { error: "Workspace não encontrado", status: 404 } as const;

  if (workspace.owner_id !== user.id) {
    if (ownerOnly) return { error: "Somente o proprietário pode realizar esta ação", status: 403 } as const;
    const { data: member } = await supabase
      .from("workspace_members")
      .select("role")
      .eq("workspace_id", workspaceId)
      .eq("user_id", user.id)
      .maybeSingle();
    if (!member || !["owner", "editor"].includes(member.role)) {
      return { error: "Sem permissão para alterar este workspace", status: 403 } as const;
    }
  }

  return { user, workspace, supabase } as const;
}

