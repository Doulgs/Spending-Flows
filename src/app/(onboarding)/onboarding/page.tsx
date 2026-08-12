"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, ChevronRight, Loader2, PiggyBank, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createClient } from "@/lib/supabase/client";

const STEPS = ["welcome", "workspace", "account", "categories", "finish"] as const;
type Step = (typeof STEPS)[number];

const SUGGESTED_EXPENSE_CATEGORIES = [
  "Moradia",
  "Alimentação",
  "Transporte",
  "Saúde",
  "Educação",
  "Lazer",
  "Compras",
  "Assinaturas",
];
const SUGGESTED_INCOME_CATEGORIES = ["Salário", "Freelance", "Investimentos", "Outros"];

export default function OnboardingPage() {
  const router = useRouter();
  const [stepIndex, setStepIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [workspace, setWorkspace] = useState({ name: "", type: "personal", currency: "BRL" });
  const [account, setAccount] = useState({ name: "Conta Principal", type: "checking", initial_balance: "0" });
  const [selectedCategories, setSelectedCategories] = useState<string[]>([
    ...SUGGESTED_EXPENSE_CATEGORIES.slice(0, 5),
    ...SUGGESTED_INCOME_CATEGORIES.slice(0, 1),
  ]);

  const step: Step = STEPS[stepIndex];

  const next = () => setStepIndex((i) => Math.min(i + 1, STEPS.length - 1));
  const back = () => setStepIndex((i) => Math.max(i - 1, 0));

  const toggleCategory = (name: string) => {
    setSelectedCategories((prev) =>
      prev.includes(name) ? prev.filter((c) => c !== name) : [...prev, name]
    );
  };

  const finishOnboarding = async () => {
    setLoading(true);
    setError(null);
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error("Sessão expirada. Faça login novamente.");
      }

      const { data: ws, error: wsError } = await supabase
        .from("workspaces")
        .insert({
          owner_id: user.id,
          name: workspace.name || "Meu Workspace",
          type: workspace.type,
          currency: workspace.currency,
        })
        .select()
        .single();
      if (wsError) throw wsError;

      await supabase.from("workspace_members").insert({
        workspace_id: ws.id,
        user_id: user.id,
        role: "owner",
      });

      await supabase.from("accounts").insert({
        workspace_id: ws.id,
        name: account.name || "Conta Principal",
        type: account.type,
        initial_balance: Number(account.initial_balance) || 0,
        current_balance: Number(account.initial_balance) || 0,
        currency: workspace.currency,
      });

      // Default categories are auto-seeded by a database trigger on workspace creation
      // (see supabase/migrations/003_seed_categories.sql). The selection above lets the
      // user preview/customize which ones they'll use most; extra custom categories can
      // be added later from the Categories page.
      const customCategories = selectedCategories.filter(
        (name) => !SUGGESTED_EXPENSE_CATEGORIES.includes(name) && !SUGGESTED_INCOME_CATEGORIES.includes(name)
      );
      if (customCategories.length) {
        await supabase.from("categories").insert(
          customCategories.map((name) => ({ workspace_id: ws.id, name, type: "expense" }))
        );
      }

      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível concluir o onboarding.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <Card className="w-full max-w-xl border-border bg-surface/95">
        <CardHeader>
          <div className="mb-4 flex items-center gap-2">
            {STEPS.map((s, i) => (
              <div
                key={s}
                className={`h-1.5 flex-1 rounded-full ${i <= stepIndex ? "bg-primary" : "bg-surface-elevated"}`}
              />
            ))}
          </div>
          <CardTitle>
            {step === "welcome" && "Bem-vindo ao Spending Flows"}
            {step === "workspace" && "Crie seu workspace"}
            {step === "account" && "Adicione sua primeira conta"}
            {step === "categories" && "Escolha suas categorias"}
            {step === "finish" && "Tudo pronto!"}
          </CardTitle>
          <CardDescription>
            {step === "welcome" && "Vamos configurar sua conta em poucos passos."}
            {step === "workspace" && "Um workspace agrupa contas, cartões e transações."}
            {step === "account" && "Você poderá adicionar mais contas depois."}
            {step === "categories" && "Selecione as categorias sugeridas que fazem sentido para você."}
            {step === "finish" && "Revise as informações e finalize a configuração."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {error && (
            <div className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          {step === "welcome" && (
            <div className="flex flex-col items-center gap-4 py-6 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/15 text-primary">
                <PiggyBank className="h-8 w-8" />
              </div>
              <p className="text-text-secondary">
                Acompanhe receitas, despesas, cartões e fluxo de caixa em um painel único e visual.
              </p>
            </div>
          )}

          {step === "workspace" && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="ws-name">Nome do workspace</Label>
                <Input
                  id="ws-name"
                  placeholder="Ex: Minhas Finanças"
                  value={workspace.name}
                  onChange={(e) => setWorkspace({ ...workspace, name: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Tipo</Label>
                  <Select
                    value={workspace.type}
                    onValueChange={(v) => setWorkspace({ ...workspace, type: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="personal">Pessoal</SelectItem>
                      <SelectItem value="business">Negócio</SelectItem>
                      <SelectItem value="family">Família</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Moeda</Label>
                  <Select
                    value={workspace.currency}
                    onValueChange={(v) => setWorkspace({ ...workspace, currency: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="BRL">Real (BRL)</SelectItem>
                      <SelectItem value="USD">Dólar (USD)</SelectItem>
                      <SelectItem value="EUR">Euro (EUR)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}

          {step === "account" && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="acc-name">Nome da conta</Label>
                <Input
                  id="acc-name"
                  value={account.name}
                  onChange={(e) => setAccount({ ...account, name: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Tipo</Label>
                  <Select value={account.type} onValueChange={(v) => setAccount({ ...account, type: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="checking">Conta corrente</SelectItem>
                      <SelectItem value="savings">Poupança</SelectItem>
                      <SelectItem value="cash">Dinheiro</SelectItem>
                      <SelectItem value="investment">Investimento</SelectItem>
                      <SelectItem value="other">Outro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="acc-balance">Saldo inicial</Label>
                  <Input
                    id="acc-balance"
                    type="number"
                    value={account.initial_balance}
                    onChange={(e) => setAccount({ ...account, initial_balance: e.target.value })}
                  />
                </div>
              </div>
            </div>
          )}

          {step === "categories" && (
            <div className="space-y-4">
              <div>
                <p className="mb-2 text-sm font-medium text-text-secondary">Despesas</p>
                <div className="flex flex-wrap gap-2">
                  {SUGGESTED_EXPENSE_CATEGORIES.map((c) => (
                    <CategoryChip
                      key={c}
                      label={c}
                      selected={selectedCategories.includes(c)}
                      onClick={() => toggleCategory(c)}
                    />
                  ))}
                </div>
              </div>
              <div>
                <p className="mb-2 text-sm font-medium text-text-secondary">Receitas</p>
                <div className="flex flex-wrap gap-2">
                  {SUGGESTED_INCOME_CATEGORIES.map((c) => (
                    <CategoryChip
                      key={c}
                      label={c}
                      selected={selectedCategories.includes(c)}
                      onClick={() => toggleCategory(c)}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === "finish" && (
            <div className="space-y-3 text-sm text-text-secondary">
              <div className="flex items-center gap-2">
                <Wallet className="h-4 w-4 text-primary" /> Workspace:{" "}
                <span className="font-medium text-text-primary">{workspace.name || "Meu Workspace"}</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-primary" /> Conta:{" "}
                <span className="font-medium text-text-primary">{account.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-primary" /> {selectedCategories.length} categorias selecionadas
              </div>
            </div>
          )}

          <div className="flex justify-between pt-2">
            <Button variant="ghost" onClick={back} disabled={stepIndex === 0 || loading}>
              Voltar
            </Button>
            {step !== "finish" ? (
              <Button onClick={next}>
                Continuar <ChevronRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button onClick={finishOnboarding} disabled={loading}>
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                Concluir
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function CategoryChip({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${
        selected
          ? "border-primary bg-primary/15 text-primary"
          : "border-border text-text-muted hover:border-border-strong"
      }`}
    >
      {label}
    </button>
  );
}
