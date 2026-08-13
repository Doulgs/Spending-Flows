"use client";

import { useState } from "react";
import Image from "next/image";
import { ArrowRight, Check, Eye, EyeOff, Loader2, LockKeyhole, Mail, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { signInWithGoogle, signInWithPassword, signUpWithPassword } from "@/features/auth/actions";
import { loginSchema, signUpSchema } from "@/lib/validations/auth";

const configured = !!process.env.NEXT_PUBLIC_SUPABASE_URL && !process.env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder");

export default function LoginPage() {
  const [mode, setMode] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const next = () => typeof window === "undefined" ? "/" : new URL(window.location.href).searchParams.get("next") ?? "/";

  async function authenticate() {
    setError(null);
    setMessage(null);
    setLoading(true);
    try {
      if (mode === "signup") {
        const parsed = signUpSchema.safeParse({ name, email, password, confirmPassword });
        if (!parsed.success) throw new Error(parsed.error.issues[0]?.message);
        const data = await signUpWithPassword(parsed.data.name, parsed.data.email, parsed.data.password);
        if (!data.session) {
          setMessage("Conta criada. Confirme seu e-mail para continuar.");
          return;
        }
      } else {
        const parsed = loginSchema.safeParse({ email, password });
        if (!parsed.success) throw new Error(parsed.error.issues[0]?.message);
        await signInWithPassword(parsed.data.email, parsed.data.password);
      }
      window.location.replace(next());
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Não foi possível autenticar.");
    } finally {
      setLoading(false);
    }
  }

  async function googleLogin() {
    setError(null);
    setLoading(true);
    try { await signInWithGoogle(next()); }
    catch (cause) {
      setError(cause instanceof Error ? cause.message : "Não foi possível iniciar o login.");
      setLoading(false);
    }
  }

  return (
    <main className="auth-grid relative min-h-svh overflow-hidden bg-background p-3 sm:p-5">
      <div className="pointer-events-none absolute inset-0 opacity-70 [background:radial-gradient(circle_at_20%_15%,hsl(var(--primary)/.16),transparent_26%),radial-gradient(circle_at_82%_88%,hsl(var(--primary)/.08),transparent_32%)]" />
      <div className="relative mx-auto grid min-h-[calc(100svh-24px)] max-w-[1480px] overflow-hidden rounded-[26px] border border-white/[0.08] bg-[#08090c] shadow-[0_40px_140px_rgba(0,0,0,.7)] sm:min-h-[calc(100svh-40px)] lg:grid-cols-[1.12fr_.88fr]">
        <section className="relative hidden overflow-hidden border-r border-white/[0.07] lg:flex lg:flex-col lg:justify-between lg:p-12 xl:p-16">
          <div className="absolute inset-0 bg-[linear-gradient(145deg,#10111a_0%,#090a0f_55%,#0d0916_100%)]" />
          <div className="absolute -left-48 top-1/3 size-[540px] rounded-full border border-primary/15 bg-primary/[0.06] blur-3xl" />
          <div className="relative z-10 flex items-center gap-3">
            <Image src="/favicon/apple-touch-icon.png" width={42} height={42} alt="" className="rounded-xl" priority />
            <div><p className="font-semibold tracking-tight">Spending Flows</p><p className="text-[10px] uppercase tracking-[.24em] text-muted-foreground">Financial command center</p></div>
          </div>
          <div className="relative z-10 max-w-2xl">
            <p className="mb-6 font-mono text-xs uppercase tracking-[.25em] text-primary">Controle sem ruído</p>
            <h1 className="font-display text-5xl font-semibold leading-[.98] tracking-[-.055em] xl:text-7xl">Seu dinheiro,<br/><span className="text-white/45">em alta definição.</span></h1>
            <p className="mt-7 max-w-lg text-base leading-7 text-white/55">Fluxos, contas e decisões reunidos em uma interface feita para enxergar o que importa antes que vire urgência.</p>
            <div className="mt-10 grid max-w-xl grid-cols-3 gap-3">
              {["Workspace seguro", "Visão compartilhada", "Dados em tempo real"].map((item) => <div key={item} className="rounded-xl border border-white/[0.07] bg-white/[0.035] p-3 text-xs text-white/65 backdrop-blur"><Check className="mb-3 size-3.5 text-primary" />{item}</div>)}
            </div>
          </div>
          <div className="relative z-10 flex items-center gap-2 text-xs text-white/35"><ShieldCheck className="size-4" /> Autenticação protegida pelo Supabase</div>
        </section>

        <section className="flex items-center justify-center px-6 py-10 sm:px-12 lg:px-14">
          <div className="w-full max-w-[420px]">
            <div className="mb-10 flex items-center gap-3 lg:hidden"><Image src="/favicon/apple-touch-icon.png" width={40} height={40} alt="" className="rounded-xl" /><div><p className="font-semibold">Spending Flows</p><p className="text-xs text-muted-foreground">Financial command center</p></div></div>
            <p className="text-xs font-medium uppercase tracking-[.2em] text-primary">Acesso seguro</p>
            <h2 className="font-display mt-3 text-4xl font-semibold tracking-[-.045em]">Organize seu fluxo.</h2>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">Entre ou crie sua conta para começar.</p>

            <Tabs value={mode} onValueChange={setMode} className="mt-8">
              <TabsList className="grid h-10 w-full grid-cols-2 bg-white/[0.045]">
                <TabsTrigger value="login">Entrar</TabsTrigger>
                <TabsTrigger value="signup">Criar conta</TabsTrigger>
              </TabsList>
              <TabsContent value="login" className="mt-6 space-y-4" />
              <TabsContent value="signup" className="mt-6 space-y-4">
                <Field label="Nome" icon={ShieldCheck}><Input value={name} onChange={(event) => setName(event.target.value)} placeholder="Como podemos te chamar?" autoComplete="name" /></Field>
              </TabsContent>
            </Tabs>

            <div className="space-y-4">
              <Field label="E-mail" icon={Mail}><Input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="voce@empresa.com" autoComplete="email" /></Field>
              <Field label="Senha" icon={LockKeyhole}>
                <div className="relative"><Input type={showPassword ? "text" : "password"} value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Mínimo de 8 caracteres" autoComplete={mode === "signup" ? "new-password" : "current-password"} className="pr-10" /><button type="button" onClick={() => setShowPassword((value) => !value)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}>{showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}</button></div>
              </Field>
              {mode === "signup" && <Field label="Confirmar senha" icon={LockKeyhole}><Input type={showPassword ? "text" : "password"} value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} placeholder="Repita sua senha" autoComplete="new-password" /></Field>}
              {!configured && <Notice tone="warning">Configure as variáveis públicas do Supabase para habilitar a autenticação.</Notice>}
              {error && <Notice tone="error">{error}</Notice>}
              {message && <Notice tone="success">{message}</Notice>}
              <Button className="h-11 w-full justify-between" disabled={loading || !configured} onClick={authenticate}>{loading ? <Loader2 className="animate-spin" /> : mode === "signup" ? "Criar minha conta" : "Entrar na plataforma"}<ArrowRight /></Button>
              <div className="relative py-2"><div className="absolute inset-x-0 top-1/2 border-t border-border"/><span className="relative mx-auto block w-fit bg-[#08090c] px-3 text-[10px] uppercase tracking-[.18em] text-muted-foreground">ou continue com</span></div>
              <Button variant="outline" className="h-11 w-full" disabled={loading || !configured} onClick={googleLogin}><GoogleIcon /> Google</Button>
            </div>
            <p className="mt-7 text-center text-[11px] leading-5 text-muted-foreground">Ao continuar, você concorda com os Termos de Uso e a Política de Privacidade.</p>
          </div>
        </section>
      </div>
    </main>
  );
}

function Field({ label, icon: Icon, children }: { label: string; icon: React.ComponentType<{ className?: string }>; children: React.ReactNode }) {
  return <div className="space-y-2"><Label className="flex items-center gap-2 text-xs text-muted-foreground"><Icon className="size-3.5" />{label}</Label>{children}</div>;
}
function Notice({ children, tone }: { children: React.ReactNode; tone: "warning" | "error" | "success" }) {
  const styles = tone === "error" ? "border-destructive/30 bg-destructive/10 text-destructive" : tone === "success" ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300" : "border-amber-500/30 bg-amber-500/10 text-amber-300";
  return <div className={`rounded-lg border p-3 text-xs leading-5 ${styles}`}>{children}</div>;
}
function GoogleIcon() { return <svg viewBox="0 0 24 24" className="size-4"><path fill="currentColor" d="M21.6 12.23c0-.71-.06-1.4-.18-2.05H12v3.87h5.38a4.6 4.6 0 0 1-2 3.02v2.51h3.24c1.9-1.74 2.98-4.31 2.98-7.35ZM12 22c2.7 0 4.96-.9 6.62-2.42l-3.24-2.51c-.9.6-2.05.96-3.38.96-2.6 0-4.8-1.76-5.59-4.12H3.07v2.59A10 10 0 0 0 12 22Zm-5.59-8.09A6.02 6.02 0 0 1 6.1 12c0-.66.11-1.3.31-1.91V7.5H3.07A10 10 0 0 0 2 12c0 1.61.39 3.14 1.07 4.5l3.34-2.59ZM12 5.97c1.47 0 2.78.5 3.82 1.49l2.87-2.87A9.62 9.62 0 0 0 12 2a10 10 0 0 0-8.93 5.5l3.34 2.59A5.98 5.98 0 0 1 12 5.97Z"/></svg>; }
