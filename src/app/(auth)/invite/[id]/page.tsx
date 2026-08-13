"use client";

import { useState } from "react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { ArrowRight, CheckCircle2, KeyRound, Loader2, UsersRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";

export default function AcceptInvitationPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [accepted, setAccepted] = useState(false);

  async function accept() {
    setLoading(true);
    setError(null);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push(`/login?next=${encodeURIComponent(`/invite/${params.id}`)}`);
        return;
      }
      if (password) {
        if (password.length < 8) throw new Error("A senha precisa ter pelo menos 8 caracteres.");
        const { error: passwordError } = await supabase.auth.updateUser({ password });
        if (passwordError) throw passwordError;
      }
      const { data, error: acceptError } = await supabase.rpc("accept_workspace_invitation", { invitation_id: params.id });
      if (acceptError) throw acceptError;
      const result = data as { workspace_id?: string } | null;
      if (result?.workspace_id) localStorage.setItem("spending-flows-invited-workspace", result.workspace_id);
      setAccepted(true);
      setTimeout(() => router.replace("/dashboard"), 900);
    } catch (cause) {
      setError(cause instanceof Error ? translateError(cause.message) : "Não foi possível aceitar o convite.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative flex min-h-svh items-center justify-center overflow-hidden bg-background p-4">
      <div className="pointer-events-none absolute inset-0 [background:radial-gradient(circle_at_50%_0%,hsl(var(--primary)/.18),transparent_34%)]" />
      <Card className="relative w-full max-w-lg overflow-hidden border-white/10 bg-card/90 shadow-[0_30px_120px_rgba(0,0,0,.65)] backdrop-blur-xl">
        <div className="h-1 bg-gradient-to-r from-transparent via-primary to-transparent" />
        <CardHeader className="items-center px-8 pt-10 text-center">
          <Image src="/favicon/apple-touch-icon.png" width={54} height={54} alt="Spending Flows" className="mb-5 rounded-2xl" priority />
          <div className="mb-4 flex size-11 items-center justify-center rounded-xl border border-primary/25 bg-primary/10 text-primary"><UsersRound className="size-5" /></div>
          <CardTitle className="font-display text-3xl tracking-[-.04em]">Você foi convidado.</CardTitle>
          <CardDescription className="max-w-sm leading-6">Aceite para adicionar o workspace compartilhado à sua conta. Se esta for sua primeira entrada, também criaremos seu workspace pessoal.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5 px-8 pb-9">
          <div className="space-y-2 rounded-xl border border-border bg-background/55 p-4">
            <Label htmlFor="invite-password" className="flex items-center gap-2 text-xs"><KeyRound className="size-3.5 text-primary" />Senha para próximos acessos <span className="text-muted-foreground">(opcional)</span></Label>
            <Input id="invite-password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Mínimo de 8 caracteres" autoComplete="new-password" />
            <p className="text-[11px] leading-5 text-muted-foreground">Se você já possui senha, deixe este campo vazio.</p>
          </div>
          {error && <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">{error}</div>}
          {accepted ? (
            <div className="flex h-11 items-center justify-center gap-2 rounded-lg border border-emerald-500/25 bg-emerald-500/10 text-sm font-medium text-emerald-300"><CheckCircle2 className="size-4" />Convite aceito. Abrindo workspace...</div>
          ) : (
            <Button className="h-11 w-full justify-between" disabled={loading} onClick={accept}>{loading ? <Loader2 className="animate-spin" /> : "Aceitar e entrar"}<ArrowRight /></Button>
          )}
        </CardContent>
      </Card>
    </main>
  );
}

function translateError(message: string) {
  if (message.includes("invitation_expired")) return "Este convite expirou. Peça um novo convite ao administrador.";
  if (message.includes("invitation_email_mismatch")) return "Este convite pertence a outro endereço de e-mail.";
  if (message.includes("invitation_not_pending")) return "Este convite já foi utilizado ou revogado.";
  if (message.includes("invitation_not_found")) return "Convite não encontrado.";
  return message;
}
