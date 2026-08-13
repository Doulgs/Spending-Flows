"use client";

import { useState } from "react";
import Image from "next/image";
import { AlertTriangle, ArrowRight, BarChart3, Loader2, ShieldCheck, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { signInWithGoogle } from "@/features/auth/actions";

const isSupabaseConfigured = !!process.env.NEXT_PUBLIC_SUPABASE_URL && !process.env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder");

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const handleGoogleLogin = async () => { setError(null); setLoading(true); try { await signInWithGoogle(); } catch (err) { setError(err instanceof Error ? err.message : "Não foi possível iniciar o login."); setLoading(false); } };

  return <main className="relative min-h-screen overflow-hidden bg-background-secondary p-3 sm:p-5">
    <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_25%_20%,hsl(var(--primary-subtle)),transparent_35%)]" />
    <div className="relative mx-auto grid min-h-[calc(100vh-24px)] max-w-[1500px] overflow-hidden rounded-[28px] border border-border-subtle bg-background shadow-2xl shadow-black/40 sm:min-h-[calc(100vh-40px)] lg:grid-cols-[1.08fr_0.92fr]">
      <section className="relative hidden min-h-full overflow-hidden border-r border-border-subtle bg-[#0d0e13] p-12 lg:flex lg:flex-col lg:justify-between xl:p-16">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,rgba(139,92,246,0.22),transparent_42%)]" />
        <div className="relative z-10 flex items-center gap-3"><Image src="/favicon/apple-touch-icon.png" width={48} height={48} alt="" className="rounded-2xl" priority /><div><p className="text-lg font-bold">Spending Flows</p><p className="text-xs uppercase tracking-[0.2em] text-text-muted">Finance OS</p></div></div>
        <div className="relative z-10 mx-auto w-full max-w-xl text-center"><Image src="/spending-flow-icon.png" width={420} height={420} alt="Rede de fluxos financeiros" className="mx-auto h-auto w-[min(58vh,420px)] rounded-[30%] object-cover shadow-[0_30px_100px_rgba(139,92,246,0.2)]" priority /><h1 className="mt-8 text-4xl font-bold tracking-[-0.04em] xl:text-5xl">Clareza para cada movimento do seu dinheiro.</h1><p className="mx-auto mt-4 max-w-lg text-base leading-relaxed text-text-secondary">Organize contas, acompanhe seu fluxo e tome decisões com uma visão financeira única.</p></div>
        <div className="relative z-10 flex items-center justify-center gap-6 text-xs text-text-muted"><span className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-primary" /> Dados protegidos</span><span className="flex items-center gap-2"><BarChart3 className="h-4 w-4 text-primary" /> Visão completa</span></div>
      </section>
      <section className="flex items-center justify-center px-6 py-12 sm:px-12 lg:px-16"><div className="w-full max-w-md">
        <div className="mb-10 flex items-center gap-3 lg:hidden"><Image src="/favicon/apple-touch-icon.png" width={44} height={44} alt="" className="rounded-xl" priority /><div><p className="font-bold">Spending Flows</p><p className="text-xs text-text-muted">Gestão financeira inteligente</p></div></div>
        <div className="mb-8 inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-primary-subtle text-primary"><Sparkles className="h-5 w-5" /></div><p className="text-sm font-semibold text-primary">Bem-vindo de volta</p><h2 className="mt-3 text-3xl font-bold tracking-[-0.04em] sm:text-4xl">Entre na sua conta</h2><p className="mt-3 text-sm leading-relaxed text-text-secondary">Acesse seus workspaces e continue de onde parou.</p>
        <div className="mt-9 space-y-4">{!isSupabaseConfigured && <div className="flex items-start gap-3 rounded-xl border border-warning-border bg-warning-subtle p-4 text-sm text-warning"><AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" /><span>Supabase ainda não está configurado. Adicione as variáveis públicas para habilitar o login.</span></div>}{error && <div className="rounded-xl border border-destructive-border bg-destructive-subtle p-4 text-sm text-destructive">{error}</div>}
          <Button className="h-12 w-full justify-between px-4" disabled={loading || !isSupabaseConfigured} onClick={handleGoogleLogin}><span className="flex items-center gap-3">{loading ? <Loader2 className="animate-spin" /> : <GoogleIcon />}Continuar com Google</span><ArrowRight className="h-4 w-4" /></Button>
        </div><p className="mt-6 text-center text-xs leading-relaxed text-text-muted">Ao continuar, você concorda com nossos Termos de Uso e Política de Privacidade.</p>
      </div></section>
    </div>
  </main>;
}

function GoogleIcon() { return <svg viewBox="0 0 24 24" className="h-4 w-4"><path fill="#fff" d="M21.6 12.23c0-.71-.06-1.4-.18-2.05H12v3.87h5.38a4.6 4.6 0 0 1-2 3.02v2.51h3.24c1.9-1.74 2.98-4.31 2.98-7.35Z"/><path fill="#fff" d="M12 22c2.7 0 4.96-.9 6.62-2.42l-3.24-2.51c-.9.6-2.05.96-3.38.96-2.6 0-4.8-1.76-5.59-4.12H3.07v2.59A10 10 0 0 0 12 22Z" opacity=".9"/><path fill="#fff" d="M6.41 13.91A6.02 6.02 0 0 1 6.1 12c0-.66.11-1.3.31-1.91V7.5H3.07A10 10 0 0 0 2 12c0 1.61.39 3.14 1.07 4.5l3.34-2.59Z" opacity=".75"/><path fill="#fff" d="M12 5.97c1.47 0 2.78.5 3.82 1.49l2.87-2.87A9.62 9.62 0 0 0 12 2a10 10 0 0 0-8.93 5.5l3.34 2.59A5.98 5.98 0 0 1 12 5.97Z" opacity=".6"/></svg>; }
