"use client";

import { useEffect, useState } from "react";
import { Bot, KeyRound, LockKeyhole, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/use-toast";
import { providerOptions, type AIProvider } from "@/lib/ai-import/schema";

type Props = { workspaceId?: string | null; canEdit: boolean };

export function WorkspaceAISettings({ workspaceId, canEdit }: Props) {
  const { toast } = useToast();
  const [provider, setProvider] = useState<AIProvider>("openai");
  const [model, setModel] = useState(providerOptions[0].model);
  const [apiKey, setApiKey] = useState("");
  const [hint, setHint] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;
    async function load() {
      setLoading(true); setHint(null); setApiKey("");
      if (!workspaceId || !canEdit) { setLoading(false); return; }
      try {
        const response = await fetch(`/api/workspace-ai-settings?workspaceId=${encodeURIComponent(workspaceId)}`);
        const payload = await response.json();
        if (!response.ok) throw new Error(payload.error);
        if (active && payload.settings) {
          setProvider(payload.settings.provider); setModel(payload.settings.model); setHint(payload.settings.api_key_hint);
        }
      } catch (error) {
        if (active) toast({ title: "Não foi possível carregar a integração de IA", description: error instanceof Error ? error.message : undefined, variant: "destructive" });
      } finally { if (active) setLoading(false); }
    }
    void load(); return () => { active = false; };
  }, [workspaceId, canEdit, toast]);

  function changeProvider(value: AIProvider) {
    setProvider(value);
    setModel(providerOptions.find((item) => item.value === value)?.model ?? "");
  }

  async function save() {
    if (!workspaceId || apiKey.trim().length < 8) return;
    setSaving(true);
    try {
      const response = await fetch("/api/workspace-ai-settings", { method: "PUT", headers: { "content-type": "application/json" }, body: JSON.stringify({ workspaceId, provider, model, apiKey }) });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error);
      setHint(`${apiKey.slice(0, 4)}••••${apiKey.slice(-4)}`); setApiKey("");
      toast({ title: "Integração de IA salva", description: "A chave foi criptografada no Vault do Supabase." });
    } catch (error) {
      toast({ title: "Não foi possível salvar a integração", description: error instanceof Error ? error.message : undefined, variant: "destructive" });
    } finally { setSaving(false); }
  }

  return <Card>
    <CardHeader>
      <div className="mb-2 flex size-10 items-center justify-center rounded-xl bg-primary-subtle text-primary"><Bot className="size-5" /></div>
      <CardTitle>Inteligência artificial</CardTitle>
      <CardDescription>Provedor usado para analisar extratos e categorizar lançamentos deste workspace.</CardDescription>
    </CardHeader>
    <CardContent className="space-y-5">
      {loading ? <><Skeleton className="h-16"/><Skeleton className="h-16"/><Skeleton className="h-16"/></> : <>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2"><Label>Provedor</Label><Select value={provider} onValueChange={(value) => changeProvider(value as AIProvider)} disabled={!canEdit}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{providerOptions.map((item) => <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>)}</SelectContent></Select></div>
          <div className="space-y-2"><Label htmlFor="ai-model">Modelo</Label><Input id="ai-model" value={model} onChange={(event) => setModel(event.target.value)} disabled={!canEdit} /></div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="ai-key">Chave de API</Label>
          <div className="relative"><KeyRound className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"/><Input id="ai-key" type="password" autoComplete="new-password" className="pl-10" value={apiKey} onChange={(event) => setApiKey(event.target.value)} placeholder={hint ? `Configurada: ${hint}` : "Cole a chave do provedor"} disabled={!canEdit}/></div>
          <p className="text-xs text-muted-foreground">A chave é criptografada no Vault e nunca volta para o navegador. Para trocar, informe uma nova chave.</p>
        </div>
        {!canEdit && <div className="flex items-center gap-2 rounded-xl border border-border bg-surface-elevated p-3 text-xs text-muted-foreground"><LockKeyhole className="size-4"/>Somente o proprietário pode configurar a IA.</div>}
        <Button onClick={save} disabled={!canEdit || saving || apiKey.trim().length < 8 || !model.trim()}><Save className="size-4"/>{saving ? "Protegendo chave..." : "Salvar integração"}</Button>
      </>}
    </CardContent>
  </Card>;
}
