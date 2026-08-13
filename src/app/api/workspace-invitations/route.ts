import { createClient as createPublicClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { invitationSchema } from "@/lib/validations/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const parsed = invitationSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Convite inválido" }, { status: 400 });
  }

  const { email, role, workspaceId } = parsed.data;
  if (email === user.email?.toLowerCase()) {
    return NextResponse.json({ error: "Você já faz parte deste workspace." }, { status: 400 });
  }

  const { data: invitation, error: insertError } = await supabase
    .from("workspace_invitations")
    .insert({ workspace_id: workspaceId, email, role, invited_by: user.id })
    .select("id")
    .single();

  if (insertError || !invitation) {
    const duplicate = insertError?.code === "23505";
    return NextResponse.json(
      { error: duplicate ? "Já existe um convite pendente para este e-mail." : insertError?.message ?? "Não foi possível criar o convite." },
      { status: duplicate ? 409 : 403 },
    );
  }

  const origin = new URL(request.url).origin;
  const nextPath = `/invite/${invitation.id}`;
  // Supabase returns a one-time code. The callback exchanges it for a session
  // before sending the invited person to the acceptance screen.
  const redirectTo = `${origin}/auth/callback?next=${encodeURIComponent(nextPath)}`;
  let emailError: Error | null = null;
  const admin = createAdminClient();

  if (admin) {
    const { error } = await admin.auth.admin.inviteUserByEmail(email, {
      redirectTo,
      data: { workspace_invitation_id: invitation.id },
    });
    emailError = error;
  }

  // Existing confirmed users cannot receive another admin invite. A magic link
  // provides the same authenticated handoff and also supports projects without a secret key.
  if (!admin || emailError) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !anonKey) emailError = new Error("Supabase não configurado");
    else {
      const publicClient = createPublicClient<Database>(url, anonKey, {
        auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false },
      });
      const { error } = await publicClient.auth.signInWithOtp({
        email,
        options: { shouldCreateUser: true, emailRedirectTo: redirectTo },
      });
      emailError = error;
    }
  }

  if (emailError) {
    await supabase.from("workspace_invitations").delete().eq("id", invitation.id);
    return NextResponse.json({ error: emailError.message }, { status: 502 });
  }

  return NextResponse.json({ invitationId: invitation.id }, { status: 201 });
}
