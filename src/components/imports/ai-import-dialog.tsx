"use client";

import { useRef, useState } from "react";
import { AlertTriangle, Bot, CheckCircle2, FileSpreadsheet, Loader2, Sparkles, UploadCloud } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/components/ui/use-toast";
import type { AIImportAnalysis, ImportOptions } from "@/lib/ai-import/schema";
import { useWorkspaceStore } from "@/stores/workspace-store";

type Stage = "upload" | "analyzing" | "review" | "applying" | "done";
type Props = { open: boolean; onOpenChange: (open: boolean) => void };

export function AIImportDialog({ open, onOpenChange }: Props) {
  const { toast } = useToast();
  const workspaceId = useWorkspaceStore((state) => state.currentWorkspaceId);
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [stage, setStage] = useState<Stage>("upload");
  const [jobId, setJobId] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<AIImportAnalysis | null>(null);
  const [result, setResult] = useState<Record<string, number> | null>(null);
  const [options, setOptions] = useState<ImportOptions>({ createCategories: true, createAccounts: true, createSubscriptions: true });

  function reset() { setFile(null); setStage("upload"); setJobId(null); setAnalysis(null); setResult(null); }
  function close(value: boolean) { if (!value && (stage === "analyzing" || stage === "applying")) return; if (!value) reset(); onOpenChange(value); }

  async function analyze() {
    if (!file || !workspaceId) return;
    setStage("analyzing");
    const form = new FormData(); form.set("workspaceId", workspaceId); form.set("file", file); form.set("options", JSON.stringify(options));
    try {
      const response = await fetch("/api/ai-imports/analyze", { method: "POST", body: form });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error);
      setJobId(payload.jobId); setAnalysis(payload.analysis); setStage("review");
    } catch (error) {
      setStage("upload"); toast({ title: "Não foi possível analisar o arquivo", description: error instanceof Error ? error.message : undefined, variant: "destructive" });
    }
  }

  async function applyImport() {
    if (!jobId || !workspaceId) return;
    setStage("applying");
    try {
      const response = await fetch("/api/ai-imports/apply", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ jobId, workspaceId }) });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error);
      setResult(payload.result); setStage("done");
      window.dispatchEvent(new Event("workspace-data-changed"));
      toast({ title: "Importação concluída", description: "Os dados já estão disponíveis no workspace." });
    } catch (error) {
      setStage("review"); toast({ title: "A importação não foi aplicada", description: error instanceof Error ? error.message : undefined, variant: "destructive" });
    }
  }

  return <Dialog open={open} onOpenChange={close}><DialogContent className="max-w-3xl p-0">
    <DialogHeader className="border-b border-border px-5 pb-4 pt-5 sm:px-6 sm:pt-6"><div className="mb-2 flex size-11 items-center justify-center rounded-2xl bg-primary-subtle text-primary"><Sparkles className="size-5"/></div><DialogTitle>Importar lançamentos com IA</DialogTitle><DialogDescription>Envie CSV, XLS, XLSX ou OFX. Você revisa tudo antes de gravar.</DialogDescription></DialogHeader>
    <div className="px-5 pb-5 sm:px-6 sm:pb-6">
      {stage === "upload" && <div className="space-y-5">
        <button type="button" onClick={() => inputRef.current?.click()} className="group flex min-h-40 w-full flex-col items-center justify-center rounded-2xl border border-dashed border-border-strong bg-surface-elevated p-5 text-center transition hover:border-primary hover:bg-primary-subtle/40">
          {file ? <><FileSpreadsheet className="mb-3 size-9 text-primary"/><span className="max-w-full truncate font-medium">{file.name}</span><span className="mt-1 text-xs text-muted-foreground">{(file.size / 1024).toFixed(1)} KB · toque para trocar</span></> : <><UploadCloud className="mb-3 size-9 text-muted-foreground transition group-hover:text-primary"/><span className="font-medium">Selecionar extrato ou planilha</span><span className="mt-1 text-xs text-muted-foreground">Máximo de 10 MB e 1.000 lançamentos</span></>}
        </button>
        <input ref={inputRef} hidden type="file" accept=".csv,.xls,.xlsx,.ofx" onChange={(event) => setFile(event.target.files?.[0] ?? null)}/>
        <div className="space-y-3"><p className="text-sm font-medium">A IA pode criar durante a importação</p>{([
          ["createCategories", "Novas categorias", "Quando nenhuma categoria existente for adequada"],
          ["createAccounts", "Novas contas", "Quando o arquivo identificar outra origem financeira"],
          ["createSubscriptions", "Assinaturas", "Quando detectar cobranças recorrentes"],
        ] as const).map(([key, title, description]) => <Label key={key} className="flex cursor-pointer items-start gap-3 rounded-xl border border-border bg-card p-3.5"><Checkbox checked={options[key]} onCheckedChange={(checked) => setOptions((value) => ({ ...value, [key]: checked === true }))}/><span><span className="block text-sm font-medium text-foreground">{title}</span><span className="mt-0.5 block text-xs font-normal text-muted-foreground">{description}</span></span></Label>)}</div>
        <DialogFooter><Button onClick={analyze} disabled={!file}><Bot className="size-4"/>Analisar com IA</Button></DialogFooter>
      </div>}
      {(stage === "analyzing" || stage === "applying") && <div className="flex min-h-72 flex-col items-center justify-center text-center"><Loader2 className="mb-4 size-10 animate-spin text-primary"/><p className="font-medium">{stage === "analyzing" ? "Lendo e categorizando seus lançamentos" : "Criando os registros com segurança"}</p><p className="mt-1 max-w-sm text-sm text-muted-foreground">{stage === "analyzing" ? "Isso pode levar alguns instantes. Não feche esta janela." : "A operação é atômica: ou tudo é criado, ou nada é alterado."}</p><Progress value={stage === "analyzing" ? 45 : 82} className="mt-5 max-w-xs"/></div>}
      {stage === "review" && analysis && <div className="space-y-4"><div className="grid grid-cols-2 gap-2 sm:grid-cols-4">{[["Lançamentos", analysis.transactions.length],["Categorias", analysis.categories.length],["Contas", analysis.accounts.length],["Assinaturas", analysis.subscriptions.length]].map(([label, value]) => <div key={label} className="rounded-xl border border-border bg-card p-3"><p className="text-2xl font-semibold">{value}</p><p className="text-xs text-muted-foreground">{label}</p></div>)}</div><div className="rounded-xl border border-border bg-surface-elevated p-4"><p className="text-sm font-medium">Resumo da análise</p><p className="mt-1 text-sm text-muted-foreground">{analysis.summary}</p></div>{analysis.warnings.length > 0 && <div className="rounded-xl border border-warning/30 bg-warning/10 p-3 text-sm"><div className="mb-2 flex items-center gap-2 font-medium text-warning"><AlertTriangle className="size-4"/>Pontos para revisar</div>{analysis.warnings.map((warning) => <p key={warning} className="text-xs text-muted-foreground">• {warning}</p>)}</div>}<ScrollArea className="h-52 rounded-xl border border-border"><div className="divide-y divide-border">{analysis.transactions.map((transaction, index) => <div key={`${transaction.date}-${index}`} className="flex items-center justify-between gap-3 p-3 text-sm"><div className="min-w-0"><p className="truncate font-medium">{transaction.description}</p><p className="text-xs text-muted-foreground">{transaction.date} · {transaction.type === "expense" ? "Despesa" : "Receita"}</p></div><span className="shrink-0 font-medium">R$ {transaction.amount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span></div>)}</div></ScrollArea><DialogFooter><Button variant="outline" onClick={reset}>Trocar arquivo</Button><Button onClick={applyImport}><CheckCircle2 className="size-4"/>Confirmar importação</Button></DialogFooter></div>}
      {stage === "done" && <div className="flex min-h-72 flex-col items-center justify-center text-center"><div className="mb-4 flex size-14 items-center justify-center rounded-full bg-success/15 text-success"><CheckCircle2 className="size-7"/></div><p className="text-lg font-semibold">Importação concluída</p><p className="mt-1 text-sm text-muted-foreground">{result?.transactions ?? 0} lançamentos e {(result?.accounts ?? 0) + (result?.categories ?? 0) + (result?.subscriptions ?? 0)} itens auxiliares foram criados.</p><Button className="mt-5" onClick={() => close(false)}>Concluir</Button></div>}
    </div>
  </DialogContent></Dialog>;
}
