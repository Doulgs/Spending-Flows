import { NextResponse } from "next/server";
import { analyzeWithAI } from "@/lib/ai-import/providers";
import { parseFinancialFile } from "@/lib/ai-import/file-parser";
import { aiProviderSchema, importOptionsSchema } from "@/lib/ai-import/schema";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireWorkspaceAccess } from "@/lib/server/workspace-access";

export const maxDuration = 120;

export async function POST(request: Request) {
  const form = await request.formData();
  const workspaceId = String(form.get("workspaceId") ?? "");
  const file = form.get("file");
  let rawOptions: unknown;
  try { rawOptions = JSON.parse(String(form.get("options") ?? "{}")); }
  catch { return NextResponse.json({ error: "Opções inválidas" }, { status: 400 }); }
  const options = importOptionsSchema.safeParse(rawOptions);
  if (!options.success || !(file instanceof File)) return NextResponse.json({ error: "Arquivo e opções são obrigatórios" }, { status: 400 });

  const access = await requireWorkspaceAccess(workspaceId);
  if ("error" in access) return NextResponse.json({ error: access.error }, { status: access.status });
  const admin = createAdminClient();
  if (!admin) return NextResponse.json({ error: "Integração segura do Supabase não configurada" }, { status: 503 });

  const { data: secrets, error: secretError } = await admin.rpc("get_workspace_ai_secret", { p_workspace_id: workspaceId });
  const setting = secrets?.[0];
  if (secretError || !setting) return NextResponse.json({ error: "Configure o provedor de IA nas configurações do workspace antes de importar." }, { status: 409 });

  let parsedFile: Awaited<ReturnType<typeof parseFinancialFile>>;
  try { parsedFile = await parseFinancialFile(file); }
  catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Arquivo inválido" }, { status: 400 }); }

  const [{ data: accounts }, { data: categories }, { data: subscriptions }] = await Promise.all([
    access.supabase.from("accounts").select("id, name, type").eq("workspace_id", workspaceId).eq("archived", false),
    access.supabase.from("categories").select("id, name, type").eq("workspace_id", workspaceId),
    access.supabase.from("subscriptions").select("id, name, frequency").eq("workspace_id", workspaceId).eq("active", true),
  ]);

  const { data: job, error: jobError } = await admin.from("ai_import_jobs").insert({
    workspace_id: workspaceId,
    created_by: access.user.id,
    provider: setting.provider,
    model: setting.model,
    file_name: file.name.slice(0, 255),
    file_type: parsedFile.extension,
    options: options.data,
    source_row_count: parsedFile.rows.length,
  }).select("id").single();
  if (jobError || !job) return NextResponse.json({ error: "Não foi possível iniciar a importação." }, { status: 500 });

  try {
    const analysis = await analyzeWithAI({
      provider: aiProviderSchema.parse(setting.provider),
      model: setting.model,
      apiKey: setting.api_key,
      rows: parsedFile.rows,
      options: options.data,
      accounts: accounts ?? [],
      categories: categories ?? [],
      subscriptions: (subscriptions ?? []).map((item) => ({ ...item, type: item.frequency })),
      currency: access.workspace.currency,
    });
    const { error: updateError } = await admin.from("ai_import_jobs").update({ status: "ready", analysis }).eq("id", job.id);
    if (updateError) throw updateError;
    return NextResponse.json({ jobId: job.id, analysis, rowCount: parsedFile.rows.length });
  } catch (error) {
    const message = error instanceof Error ? error.message : "A IA não conseguiu analisar o arquivo.";
    await admin.from("ai_import_jobs").update({ status: "failed", error_message: message.slice(0, 1000) }).eq("id", job.id);
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
