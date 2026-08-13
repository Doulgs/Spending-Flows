import { NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireWorkspaceAccess } from "@/lib/server/workspace-access";

const schema = z.object({ jobId: z.string().uuid(), workspaceId: z.string().uuid() });

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Importação inválida" }, { status: 400 });
  const access = await requireWorkspaceAccess(parsed.data.workspaceId);
  if ("error" in access) return NextResponse.json({ error: access.error }, { status: access.status });
  const admin = createAdminClient();
  if (!admin) return NextResponse.json({ error: "Integração segura do Supabase não configurada" }, { status: 503 });

  const { data: job } = await admin.from("ai_import_jobs").select("workspace_id, created_by").eq("id", parsed.data.jobId).maybeSingle();
  if (!job || job.workspace_id !== parsed.data.workspaceId || job.created_by !== access.user.id) {
    return NextResponse.json({ error: "Importação não encontrada" }, { status: 404 });
  }
  const actorName = access.user.user_metadata.full_name ?? access.user.user_metadata.name ?? access.user.email?.split("@")[0] ?? "Usuário";
  const { data, error } = await admin.rpc("apply_ai_import_job", {
    p_job_id: parsed.data.jobId,
    p_actor_id: access.user.id,
    p_actor_name: actorName,
  });
  if (error) return NextResponse.json({ error: "Não foi possível aplicar a importação. Nenhum registro foi criado." }, { status: 500 });
  return NextResponse.json({ result: data });
}

