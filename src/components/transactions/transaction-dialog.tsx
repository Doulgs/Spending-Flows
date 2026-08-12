"use client";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";

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
    async function loadData() {
      const supabase = createClient();
      const [{ data: accData }, { data: catData }] = await Promise.all([
        supabase.from("accounts").select("*").eq("workspace_id", currentWorkspaceId),
        supabase.from("categories").select("*").eq("workspace_id", currentWorkspaceId),
      ]);
      setAccounts((accData as Account[]) ?? []);
      setCategories((catData as Category[]) ?? []);
    }
    loadData().catch(() => {
      /* handled via graceful empty state */
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
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{transaction?.id ? "Editar transação" : "Nova transação"}</DialogTitle>
        </DialogHeader>

        <Tabs value={type} onValueChange={(v) => form.setValue("type", v as TransactionInput["type"])}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="expense">Despesa</TabsTrigger>
            <TabsTrigger value="income">Receita</TabsTrigger>
            <TabsTrigger value="transfer">Transferência</TabsTrigger>
          </TabsList>
        </Tabs>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Supermercado" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valor</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" {...field} />
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

            <FormField
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
            />

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

            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                Salvar
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
