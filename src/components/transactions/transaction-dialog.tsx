"use client";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowDownLeft, ArrowLeftRight, ArrowUpRight, Loader2, ReceiptText } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { createClient } from "@/lib/supabase/client";
import { transactionSchema, type TransactionInput } from "@/lib/validations/transaction";
import { useWorkspaceStore } from "@/stores/workspace-store";
import type { Account, Category, Transaction } from "@/types";

interface TransactionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultType?: "income" | "expense" | "transfer";
  transaction?: Transaction | null;
  onSaved?: () => void;
}

export function TransactionDialog({
  open,
  onOpenChange,
  defaultType = "expense",
  transaction,
  onSaved,
}: TransactionDialogProps) {
  const { toast } = useToast();
  const currentWorkspaceId = useWorkspaceStore((s) => s.currentWorkspaceId);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(false);

  const form = useForm<TransactionInput>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      type: defaultType,
      description: "",
      amount: 0,
      date: new Date().toISOString().slice(0, 10),
      status: "completed",
    },
  });

  useEffect(() => {
    if (!open) return;
    form.reset({
      type: transaction?.type ?? defaultType,
      description: transaction?.description ?? "",
      amount: transaction?.amount ?? 0,
      date: transaction?.date ?? new Date().toISOString().slice(0, 10),
      status: transaction?.status ?? "completed",
      account_id: transaction?.account_id ?? undefined,
      category_id: transaction?.category_id ?? undefined,
      transfer_account_id: transaction?.transfer_account_id ?? undefined,
      notes: transaction?.notes ?? undefined,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, transaction, defaultType]);

  useEffect(() => {
    if (!open || !currentWorkspaceId) return;
    const activeWorkspaceId = currentWorkspaceId;
    async function loadData() {
      setDataLoading(true);
      const supabase = createClient();
      const [{ data: accData, error: accountError }, { data: catData, error: categoryError }] = await Promise.all([
        supabase.from("accounts").select("*").eq("workspace_id", activeWorkspaceId),
        supabase.from("categories").select("*").eq("workspace_id", activeWorkspaceId),
      ]);
      if (accountError || categoryError) throw accountError ?? categoryError;
      setAccounts((accData as Account[]) ?? []);
      setCategories((catData as Category[]) ?? []);
      setDataLoading(false);
    }
    loadData().catch(() => {
      setDataLoading(false);
    });
  }, [open, currentWorkspaceId]);

  const type = form.watch("type");
  const filteredCategories = categories.filter((c) => c.type === (type === "income" ? "income" : "expense"));

  const onSubmit = async (values: TransactionInput) => {
    if (!currentWorkspaceId) {
      toast({ title: "Selecione um workspace antes de continuar.", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const supabase = createClient();
      const payload = {
        workspace_id: currentWorkspaceId,
        type: values.type,
        description: values.description,
        amount: values.amount,
        date: values.date,
        status: values.status,
        account_id: values.account_id || null,
        transfer_account_id: values.type === "transfer" ? values.transfer_account_id || null : null,
        category_id: values.type === "transfer" ? null : values.category_id || null,
        notes: values.notes || null,
      };

      if (transaction?.id) {
        const { error } = await supabase.from("transactions").update(payload).eq("id", transaction.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("transactions").insert(payload);
        if (error) throw error;
      }

      toast({ title: "Transação salva com sucesso." });
      onOpenChange(false);
      onSaved?.();
    } catch (err) {
      toast({
        title: "Não foi possível salvar a transação",
        description: err instanceof Error ? err.message : "Verifique a configuração do Supabase.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[96svh] w-[calc(100%-0.75rem)] gap-0 overflow-hidden rounded-[24px] border-border bg-background p-0 sm:max-w-2xl">
        <DialogHeader className="border-b border-border bg-surface px-5 py-5 text-left sm:px-7">
          <div className="flex items-center gap-3"><div className="flex size-10 items-center justify-center rounded-xl bg-primary-subtle text-primary"><ReceiptText className="size-5"/></div><div><DialogTitle className="text-xl">{transaction?.id ? "Editar lançamento" : "Novo lançamento"}</DialogTitle><p className="mt-1 text-xs text-text-muted">Registre os detalhes para manter seu fluxo sempre atualizado.</p></div></div>
        </DialogHeader>

        <div className="scrollbar-thin overflow-y-auto px-4 py-5 sm:px-7">
        <Tabs value={type} onValueChange={(v) => form.setValue("type", v as TransactionInput["type"])}>
          <TabsList className="grid h-auto w-full grid-cols-3 bg-surface p-1">
            <TabsTrigger value="expense" className="min-h-11 gap-1.5"><ArrowUpRight className="hidden size-4 sm:block"/>Despesa</TabsTrigger>
            <TabsTrigger value="income" className="min-h-11 gap-1.5"><ArrowDownLeft className="hidden size-4 sm:block"/>Receita</TabsTrigger>
            <TabsTrigger value="transfer" className="min-h-11 gap-1.5"><ArrowLeftRight className="hidden size-4 sm:block"/>Transferir</TabsTrigger>
          </TabsList>
        </Tabs>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="mt-5 space-y-5">
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome do lançamento</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Supermercado" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valor</FormLabel>
                    <FormControl>
                      <Input type="number" inputMode="decimal" step="0.01" placeholder="0,00" className="h-12 text-lg font-semibold tabular-nums" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {dataLoading ? <div className="space-y-3"><Skeleton className="h-11 w-full"/><Skeleton className="h-11 w-full"/></div> : <FormField
              control={form.control}
              name="account_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{type === "transfer" ? "Conta de origem" : "Conta"}</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a conta" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {accounts.map((a) => (
                        <SelectItem key={a.id} value={a.id}>
                          {a.name}
                        </SelectItem>
                      ))}
                      {accounts.length === 0 && (
                        <div className="px-2 py-1.5 text-sm text-text-muted">Nenhuma conta cadastrada</div>
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />}

            {type === "transfer" ? (
              <FormField
                control={form.control}
                name="transfer_account_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Conta de destino</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a conta destino" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {accounts.map((a) => (
                          <SelectItem key={a.id} value={a.id}>
                            {a.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ) : (
              <FormField
                control={form.control}
                name="category_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Categoria</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a categoria" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {filteredCategories.map((c) => (
                          <SelectItem key={c.id} value={c.id}>
                            {c.name}
                          </SelectItem>
                        ))}
                        {filteredCategories.length === 0 && (
                          <div className="px-2 py-1.5 text-sm text-text-muted">Nenhuma categoria cadastrada</div>
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição <span className="font-normal text-text-muted">(opcional)</span></FormLabel>
                  <FormControl><Textarea placeholder="Adicione contexto, observações ou detalhes deste lançamento..." className="min-h-24 resize-none" {...field} value={field.value ?? ""} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="completed">Concluída</SelectItem>
                      <SelectItem value="pending">Pendente</SelectItem>
                      <SelectItem value="scheduled">Agendada</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="sticky bottom-0 -mx-4 -mb-5 border-t border-border bg-background px-4 py-4 sm:-mx-7 sm:px-7">
              <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit" className="min-h-11 sm:min-w-32" disabled={loading || dataLoading}>
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                Salvar
              </Button>
            </DialogFooter>
          </form>
        </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
