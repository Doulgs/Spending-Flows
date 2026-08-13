"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Building2, Check, ChevronLeft, ChevronRight, CircleDollarSign, Landmark, LayoutGrid, Loader2, Sparkles, Wallet } from "lucide-react";
import { AccentColorPicker } from "@/components/workspaces/accent-color-picker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createClient } from "@/lib/supabase/client";
import { applyAccentTheme, DEFAULT_ACCENT_COLOR, isValidAccentColor, normalizeAccentColor } from "@/lib/theme";
import { cn } from "@/lib/utils";

const STEPS = [
  { id: "welcome", label: "Boas-vindas", description: "Conheça seu novo espaço financeiro", icon: Sparkles },
  { id: "workspace", label: "Workspace", description: "Defina nome, moeda e identidade", icon: Building2 },
  { id: "account", label: "Conta principal", description: "Adicione seu primeiro saldo", icon: Landmark },
  { id: "categories", label: "Categorias", description: "Personalize sua organização", icon: LayoutGrid },
  { id: "finish", label: "Revisão", description: "Confira e comece a usar", icon: Check },
] as const;
const EXPENSE_CATEGORIES = ["Moradia", "Alimentação", "Transporte", "Saúde", "Educação", "Lazer", "Compras", "Assinaturas"];
const INCOME_CATEGORIES = ["Salário", "Freelance", "Investimentos", "Outros"];

export default function OnboardingPage() {
  const router = useRouter();
  const [stepIndex, setStepIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [workspace, setWorkspace] = useState({ name: "", type: "personal", currency: "BRL", accent_color: DEFAULT_ACCENT_COLOR });
  const [account, setAccount] = useState({ name: "Conta Principal", type: "checking", initial_balance: "0" });
  const [selectedCategories, setSelectedCategories] = useState<string[]>([...EXPENSE_CATEGORIES.slice(0, 5), INCOME_CATEGORIES[0]]);
  const step = STEPS[stepIndex];

  useEffect(() => { applyAccentTheme(document.documentElement, workspace.accent_color); }, [workspace.accent_color]);
  const next = () => { setError(null); if (step.id === "workspace" && workspace.name.trim().length < 2) return setError("Informe um nome com pelo menos 2 caracteres."); if (!isValidAccentColor(workspace.accent_color)) return setError("Informe uma cor hexadecimal válida."); setStepIndex((index) => Math.min(index + 1, STEPS.length - 1)); };
  const back = () => { setError(null); setStepIndex((index) => Math.max(index - 1, 0)); };
  const toggleCategory = (name: string) => setSelectedCategories((current) => current.includes(name) ? current.filter((item) => item !== name) : [...current, name]);

  const finishOnboarding = async () => {
    setLoading(true); setError(null);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Sessão expirada. Faça login novamente.");
      const { data: ws, error: wsError } = await supabase.from("workspaces").insert({ owner_id: user.id, name: workspace.name.trim() || "Meu Workspace", type: workspace.type, currency: workspace.currency, accent_color: normalizeAccentColor(workspace.accent_color) }).select().single();
      if (wsError) throw wsError;
      const { error: memberError } = await supabase.from("workspace_members").insert({ workspace_id: ws.id, user_id: user.id, role: "owner" });
      if (memberError) throw memberError;
      const { error: accountError } = await supabase.from("accounts").insert({ workspace_id: ws.id, name: account.name.trim() || "Conta Principal", type: account.type, initial_balance: Number(account.initial_balance) || 0, current_balance: Number(account.initial_balance) || 0, currency: workspace.currency });
      if (accountError) throw accountError;
      router.push("/dashboard"); router.refresh();
    } catch (err) { setError(err instanceof Error ? err.message : "Não foi possível concluir o onboarding."); }
    finally { setLoading(false); }
  };

  return <main className="min-h-screen bg-background-secondary p-3 sm:p-5">
    <div className="mx-auto grid min-h-[calc(100vh-24px)] max-w-[1440px] overflow-hidden rounded-[28px] border border-border-subtle bg-background shadow-2xl shadow-black/40 sm:min-h-[calc(100vh-40px)] lg:grid-cols-[350px_1fr]">
      <aside className="relative hidden overflow-hidden border-r border-border-subtle bg-[#0d0e13] p-8 lg:flex lg:flex-col"><div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_10%,hsl(var(--primary-subtle)),transparent_38%)]" /><div className="relative flex items-center gap-3"><Image src="/favicon/apple-touch-icon.png" width={44} height={44} alt="" className="rounded-xl" priority /><div><p className="font-bold">Spending Flows</p><p className="text-xs text-text-muted">Configuração inicial</p></div></div>
        <div className="relative my-auto space-y-3">{STEPS.map((item, index) => { const Icon = item.icon; const current = index === stepIndex; const complete = index < stepIndex; return <div key={item.id} className={cn("flex gap-3 rounded-2xl border p-3.5 transition-colors", current ? "border-primary-border bg-primary-subtle" : "border-transparent")}><div className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-xl", complete ? "bg-primary text-primary-foreground" : current ? "bg-primary-soft text-primary" : "bg-surface text-text-muted")}>{complete ? <Check className="h-4 w-4" /> : <Icon className="h-4 w-4" />}</div><div><p className={cn("text-sm font-semibold", current || complete ? "text-text-primary" : "text-text-muted")}>{item.label}</p><p className="mt-0.5 text-[11px] leading-relaxed text-text-muted">{item.description}</p></div></div>; })}</div>
        <p className="relative text-xs leading-relaxed text-text-muted">Seu workspace mantém contas, cartões e movimentações organizados em um só lugar.</p>
      </aside>
      <section className="flex min-w-0 flex-col"><div className="border-b border-border-subtle px-5 py-5 sm:px-8 lg:hidden"><div className="flex items-center justify-between"><div className="flex items-center gap-3"><Image src="/favicon/apple-touch-icon.png" width={38} height={38} alt="" className="rounded-xl" /><div><p className="text-sm font-bold">Spending Flows</p><p className="text-[10px] text-text-muted">Etapa {stepIndex + 1} de {STEPS.length}</p></div></div><span className="text-xs font-semibold text-primary">{step.label}</span></div><div className="mt-4 grid grid-cols-5 gap-2">{STEPS.map((item, index) => <div key={item.id} className={cn("h-1 rounded-full", index <= stepIndex ? "bg-primary" : "bg-surface-elevated")} />)}</div></div>
        <div className="flex flex-1 items-center justify-center overflow-y-auto px-5 py-8 sm:px-10 lg:px-16"><div className="w-full max-w-2xl"><div className="mb-8"><p className="text-sm font-semibold text-primary">Etapa {stepIndex + 1} de {STEPS.length}</p><h1 className="mt-2 text-3xl font-bold tracking-[-0.04em] sm:text-4xl">{step.label}</h1><p className="mt-3 text-sm text-text-secondary">{step.description}</p></div>
          {error && <div className="mb-6 rounded-xl border border-destructive-border bg-destructive-subtle p-4 text-sm text-destructive">{error}</div>}
          <div className="min-h-[290px]">{step.id === "welcome" && <Welcome />}{step.id === "workspace" && <WorkspaceStep workspace={workspace} setWorkspace={setWorkspace} />}{step.id === "account" && <AccountStep account={account} setAccount={setAccount} />}{step.id === "categories" && <CategoriesStep selected={selectedCategories} toggle={toggleCategory} />}{step.id === "finish" && <Review workspace={workspace} account={account} categoryCount={selectedCategories.length} />}</div>
          <div className="mt-9 flex items-center justify-between border-t border-border-subtle pt-6"><Button variant="ghost" onClick={back} disabled={stepIndex === 0 || loading}><ChevronLeft /> Voltar</Button>{step.id === "finish" ? <Button onClick={finishOnboarding} disabled={loading}>{loading && <Loader2 className="animate-spin" />} Criar workspace</Button> : <Button onClick={next}>Continuar <ChevronRight /></Button>}</div>
        </div></div>
      </section>
    </div>
  </main>;
}

function Welcome() { return <div className="grid gap-4 sm:grid-cols-3">{[{ icon: CircleDollarSign, title: "Visão completa", text: "Saldos e movimentações em um único painel." }, { icon: LayoutGrid, title: "Organização", text: "Categorias e recorrências feitas para sua rotina." }, { icon: Sparkles, title: "Sua identidade", text: "Um workspace com a cor que representa você." }].map(({ icon: Icon, title, text }) => <div key={title} className="rounded-2xl border border-border bg-surface p-5"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-subtle text-primary"><Icon className="h-5 w-5" /></div><p className="mt-5 font-semibold">{title}</p><p className="mt-2 text-xs leading-relaxed text-text-muted">{text}</p></div>)}</div>; }
function WorkspaceStep({ workspace, setWorkspace }: { workspace: { name: string; type: string; currency: string; accent_color: string }; setWorkspace: React.Dispatch<React.SetStateAction<{ name: string; type: string; currency: string; accent_color: string }>> }) { return <div className="space-y-6"><div className="space-y-2"><Label htmlFor="workspace-name">Nome do workspace</Label><Input id="workspace-name" placeholder="Ex: Minhas Finanças" value={workspace.name} onChange={(event) => setWorkspace({ ...workspace, name: event.target.value })} /></div><div className="grid gap-4 sm:grid-cols-2"><div className="space-y-2"><Label>Tipo</Label><Select value={workspace.type} onValueChange={(type) => setWorkspace({ ...workspace, type })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="personal">Pessoal</SelectItem><SelectItem value="business">Negócio</SelectItem><SelectItem value="family">Família</SelectItem></SelectContent></Select></div><div className="space-y-2"><Label>Moeda</Label><Select value={workspace.currency} onValueChange={(currency) => setWorkspace({ ...workspace, currency })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="BRL">Real (BRL)</SelectItem><SelectItem value="USD">Dólar (USD)</SelectItem><SelectItem value="EUR">Euro (EUR)</SelectItem></SelectContent></Select></div></div><div className="rounded-2xl border border-border bg-surface p-5"><AccentColorPicker value={workspace.accent_color} onChange={(accent_color) => setWorkspace({ ...workspace, accent_color })} /></div></div>; }
function AccountStep({ account, setAccount }: { account: { name: string; type: string; initial_balance: string }; setAccount: React.Dispatch<React.SetStateAction<{ name: string; type: string; initial_balance: string }>> }) { return <div className="space-y-5"><div className="space-y-2"><Label htmlFor="account-name">Nome da conta</Label><Input id="account-name" value={account.name} onChange={(event) => setAccount({ ...account, name: event.target.value })} /></div><div className="grid gap-4 sm:grid-cols-2"><div className="space-y-2"><Label>Tipo</Label><Select value={account.type} onValueChange={(type) => setAccount({ ...account, type })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="checking">Conta corrente</SelectItem><SelectItem value="savings">Poupança</SelectItem><SelectItem value="cash">Dinheiro</SelectItem><SelectItem value="investment">Investimento</SelectItem><SelectItem value="other">Outro</SelectItem></SelectContent></Select></div><div className="space-y-2"><Label htmlFor="balance">Saldo inicial</Label><Input id="balance" type="number" value={account.initial_balance} onChange={(event) => setAccount({ ...account, initial_balance: event.target.value })} /></div></div></div>; }
function CategoriesStep({ selected, toggle }: { selected: string[]; toggle: (name: string) => void }) { return <div className="space-y-6"><CategoryGroup label="Despesas" items={EXPENSE_CATEGORIES} selected={selected} toggle={toggle} /><CategoryGroup label="Receitas" items={INCOME_CATEGORIES} selected={selected} toggle={toggle} /></div>; }
function CategoryGroup({ label, items, selected, toggle }: { label: string; items: string[]; selected: string[]; toggle: (name: string) => void }) { return <div><p className="mb-3 text-sm font-semibold text-text-secondary">{label}</p><div className="flex flex-wrap gap-2">{items.map((item) => { const active = selected.includes(item); return <button key={item} type="button" aria-pressed={active} onClick={() => toggle(item)} className={cn("rounded-xl border px-3.5 py-2 text-sm font-medium transition-colors", active ? "border-primary-border bg-primary-subtle text-primary" : "border-border bg-surface text-text-secondary hover:bg-surface-elevated")}>{active && <Check className="mr-1.5 inline h-3.5 w-3.5" />}{item}</button>; })}</div></div>; }
function Review({ workspace, account, categoryCount }: { workspace: { name: string; type: string; currency: string; accent_color: string }; account: { name: string; initial_balance: string }; categoryCount: number }) { return <div className="overflow-hidden rounded-2xl border border-border bg-surface"><div className="flex items-center gap-4 border-b border-border-subtle p-5"><div className="h-12 w-12 rounded-2xl" style={{ backgroundColor: normalizeAccentColor(workspace.accent_color) }} /><div><p className="font-semibold">{workspace.name || "Meu Workspace"}</p><p className="text-xs text-text-muted">{workspace.currency} · {workspace.type === "business" ? "Negócio" : workspace.type === "family" ? "Família" : "Pessoal"}</p></div></div><div className="grid gap-3 p-5 sm:grid-cols-2"><Summary icon={Wallet} label="Conta principal" value={account.name} /><Summary icon={CircleDollarSign} label="Saldo inicial" value={account.initial_balance || "0"} /><Summary icon={LayoutGrid} label="Categorias" value={`${categoryCount} selecionadas`} /><Summary icon={Sparkles} label="Tema" value={normalizeAccentColor(workspace.accent_color)} /></div></div>; }
function Summary({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string }) { return <div className="flex items-center gap-3 rounded-xl bg-surface-elevated p-3"><Icon className="h-4 w-4 text-primary" /><div><p className="text-[10px] uppercase tracking-wider text-text-muted">{label}</p><p className="mt-0.5 text-sm font-semibold">{value}</p></div></div>; }
