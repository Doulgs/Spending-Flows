"use client";
import { useMemo, useState } from "react";
import { format, parseISO } from "date-fns";
import { Plus, Trash2, Pencil } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/use-toast";
import { TransactionDialog } from "@/components/transactions/transaction-dialog";
import { useWorkspaceTable } from "@/hooks/use-workspace-table";
import { createClient } from "@/lib/supabase/client";
import { formatCurrency } from "@/lib/utils";
import type { Account, Category, Transaction } from "@/types";
import { CategoryIcon } from "@/components/categories/category-icon";

export default function TransactionsPage() {
  const { data: transactions, loading, error, refresh } = useWorkspaceTable<Transaction>("transactions", {
    orderBy: { column: "date", ascending: false },
  });
  const { data: accounts } = useWorkspaceTable<Account>("accounts");
  const { data: categories } = useWorkspaceTable<Category>("categories");
  const { toast } = useToast();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Transaction | null>(null);
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [accountFilter, setAccountFilter] = useState<string>("all");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    return transactions.filter((t) => {
      if (typeFilter !== "all" && t.type !== typeFilter) return false;
      if (accountFilter !== "all" && t.account_id !== accountFilter) return false;
      if (search && !t.description.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [transactions, typeFilter, accountFilter, search]);

  const categoryName = (id: string | null) => categories.find((c) => c.id === id)?.name ?? "—";
  const categoryFor = (id: string | null) => categories.find((category) => category.id === id);
  const accountName = (id: string | null) => accounts.find((a) => a.id === id)?.name ?? "—";

  const handleDelete = async (id: string) => {
    try {
      const supabase = createClient();
      const { error: delError } = await supabase.from("transactions").delete().eq("id", id);
      if (delError) throw delError;
      toast({ title: "Transação removida." });
      refresh();
    } catch (err) {
      toast({
        title: "Não foi possível remover a transação",
        description: err instanceof Error ? err.message : undefined,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="grid w-full grid-cols-2 gap-2 sm:flex sm:w-auto sm:flex-wrap sm:items-center sm:gap-3">
          <Input
            placeholder="Buscar transação..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="col-span-2 w-full sm:w-56"
          />
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="Tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os tipos</SelectItem>
              <SelectItem value="income">Receita</SelectItem>
              <SelectItem value="expense">Despesa</SelectItem>
              <SelectItem value="transfer">Transferência</SelectItem>
            </SelectContent>
          </Select>
          <Select value={accountFilter} onValueChange={setAccountFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Conta" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as contas</SelectItem>
              {accounts.map((a) => (
                <SelectItem key={a.id} value={a.id}>
                  {a.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button className="w-full sm:w-auto"
          onClick={() => {
            setEditing(null);
            setDialogOpen(true);
          }}
        >
          <Plus className="h-4 w-4" /> Nova transação
        </Button>
      </div>

      {error && (
        <div className="rounded-md border border-warning-border bg-warning-subtle p-4 text-sm text-warning">
          Não foi possível carregar as transações ({error}).
        </div>
      )}

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="space-y-3 p-5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-14 w-full rounded-xl" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-10 text-center text-sm text-text-muted">Nenhuma transação encontrada.</div>
          ) : (
            <>
            <div className="space-y-2 p-3 md:hidden">
              {filtered.map((transaction) => {
                const category = categoryFor(transaction.category_id);
                return <article key={transaction.id} className="rounded-xl border border-border bg-surface p-4"><div className="flex items-start gap-3"><div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-surface-elevated" style={{ color: category?.color ?? undefined }}><CategoryIcon name={category?.icon} className="size-4"/></div><div className="min-w-0 flex-1"><div className="flex items-start justify-between gap-3"><div className="min-w-0"><h3 className="truncate text-sm font-semibold">{transaction.description}</h3><p className="mt-1 truncate text-xs text-text-muted">{category?.name ?? "Sem categoria"} · {accountName(transaction.account_id)}</p></div><p className={transaction.type === "expense" ? "shrink-0 text-sm font-semibold tabular-nums text-destructive" : "shrink-0 text-sm font-semibold tabular-nums text-success"}>{transaction.type === "expense" ? "−" : "+"}{formatCurrency(Number(transaction.amount))}</p></div>{transaction.notes && <p className="mt-2 line-clamp-2 text-xs leading-5 text-text-muted">{transaction.notes}</p>}<div className="mt-3 flex items-center justify-between border-t border-border pt-3"><div><p className="text-[10px] text-text-muted">{format(parseISO(transaction.date), "dd/MM/yyyy")}</p><p className="mt-0.5 text-[10px] text-text-muted">Lançado por {transaction.created_by_name ?? "Usuário"}</p></div><div className="flex gap-1"><Button size="icon" variant="ghost" className="size-9" onClick={() => { setEditing(transaction); setDialogOpen(true); }}><Pencil className="size-3.5"/><span className="sr-only">Editar</span></Button><Button size="icon" variant="ghost" className="size-9" onClick={() => handleDelete(transaction.id)}><Trash2 className="size-3.5"/><span className="sr-only">Excluir</span></Button></div></div></div></div></article>;
              })}
            </div>
            <div className="hidden overflow-x-auto md:block">
            <table className="w-full min-w-[860px] text-sm">
              <thead>
                <tr className="border-b border-border-subtle text-left">
                  <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-text-muted">Descrição</th>
                  <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-text-muted">Categoria</th>
                  <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-text-muted">Conta</th>
                  <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-text-muted">Data</th>
                  <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-text-muted">Status</th>
                  <th className="px-5 py-3.5 text-right text-xs font-semibold uppercase tracking-wider text-text-muted">Valor</th>
                  <th className="px-5 py-3.5" />
                </tr>
              </thead>
              <tbody>
                {filtered.map((t) => (
                  <tr key={t.id} className="border-b border-border-subtle last:border-0 transition-colors hover:bg-surface-hover">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-xs font-bold ${t.type === "income" ? "bg-success-subtle text-success" : t.type === "expense" ? "bg-destructive-subtle text-destructive" : "bg-primary-subtle text-primary"}`}>
                          {t.type === "income" ? "+" : t.type === "expense" ? "−" : "⇄"}
                        </div>
                        <div><span className="font-medium text-text-primary">{t.description}</span><p className="mt-1 text-[10px] text-text-muted">Lançado por {t.created_by_name ?? "Usuário"}</p></div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-text-muted">{categoryName(t.category_id)}</td>
                    <td className="px-5 py-3.5 text-text-muted">{accountName(t.account_id)}</td>
                    <td className="px-5 py-3.5 text-text-muted">{format(parseISO(t.date), "dd/MM/yyyy")}</td>
                    <td className="px-5 py-3.5">
                      <Badge variant={t.status === "completed" ? "success" : t.status === "pending" ? "warning" : "outline"}>
                        {t.status === "completed" ? "Concluída" : t.status === "pending" ? "Pendente" : "Agendada"}
                      </Badge>
                    </td>
                    <td
                      className={`px-5 py-3.5 text-right font-semibold tabular-nums ${
                        t.type === "income" ? "text-success" : t.type === "expense" ? "text-destructive" : "text-text-primary"
                      }`}
                    >
                      {t.type === "expense" ? "-" : ""}
                      {formatCurrency(Number(t.amount))}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex justify-end gap-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 rounded-lg"
                          onClick={() => {
                            setEditing(t);
                            setDialogOpen(true);
                          }}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button size="icon" variant="ghost" className="h-8 w-8 rounded-lg" onClick={() => handleDelete(t.id)}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
            </>
          )}
        </CardContent>
      </Card>

      <TransactionDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        transaction={editing}
        onSaved={refresh}
      />
    </div>
  );
}
