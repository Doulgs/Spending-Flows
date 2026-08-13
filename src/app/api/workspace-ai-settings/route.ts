import { NextResponse } from "next/server";
import { aiSettingsSchema } from "@/lib/ai-import/schema";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireWorkspaceAccess } from "@/lib/server/workspace-access";

export async function GET(request: Request) {
  const workspaceId = new URL(request.url).searchParams.get("workspaceId");
  if (!workspaceId) return NextResponse.json({ error: "Workspace obrigatório" }, { status: 400 });
  const access = await requireWorkspaceAccess(workspaceId, true);
  if ("error" in access) return NextResponse.json({ error: access.error }, { status: access.status });

  const { data, error } = await access.supabase
    .from("workspace_ai_settings")
    .select("provider, model, api_key_hint, updated_at")
    .eq("workspace_id", workspaceId)
    .maybeSingle();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ settings: data });
}

export async function PUT(request: Request) {
  const parsed = aiSettingsSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Configuração inválida" }, { status: 400 });
  const access = await requireWorkspaceAccess(parsed.data.workspaceId, true);
  if ("error" in access) return NextResponse.json({ error: access.error }, { status: access.status });
  const admin = createAdminClient();
  if (!admin) return NextResponse.json({ error: "SUPABASE_SECRET_KEY não configurada no servidor" }, { status: 503 });

  const { error } = await admin.rpc("save_workspace_ai_setting", {
    p_workspace_id: parsed.data.workspaceId,
    p_provider: parsed.data.provider,
    p_model: parsed.data.model,
    p_api_key: parsed.data.apiKey,
    p_updated_by: access.user.id,
  });
  if (error) return NextResponse.json({ error: "Não foi possível proteger a chave de API." }, { status: 500 });
  return NextResponse.json({ success: true });
}

