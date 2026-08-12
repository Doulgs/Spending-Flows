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
        <div className="flex flex-wrap items-center gap-3">
          <Input
            placeholder="Buscar transação..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-56"
          />
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-40">
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
            <SelectTrigger className="w-48">
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
        <Button
          onClick={() => {
            setEditing(null);
            setDialogOpen(true);
          }}
        >
          <Plus className="h-4 w-4" /> Nova transação
        </Button>
      </div>

      {error && (
        <div className="rounded-md border border-warning/30 bg-warning/10 p-4 text-sm text-warning">
          Não foi possível carregar as transações ({error}).
        </div>
      )}

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="space-y-2 p-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-10 text-center text-sm text-text-muted">Nenhuma transação encontrada.</div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-text-muted">
                  <th className="px-4 py-3 font-medium">Descrição</th>
                  <th className="px-4 py-3 font-medium">Categoria</th>
                  <th className="px-4 py-3 font-medium">Conta</th>
                  <th className="px-4 py-3 font-medium">Data</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 text-right font-medium">Valor</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {filtered.map((t) => (
                  <tr key={t.id} className="border-b border-border last:border-0 hover:bg-surface-elevated/40">
                    <td className="px-4 py-3 text-text-primary">{t.description}</td>
                    <td className="px-4 py-3 text-text-secondary">{categoryName(t.category_id)}</td>
                    <td className="px-4 py-3 text-text-secondary">{accountName(t.account_id)}</td>
                    <td className="px-4 py-3 text-text-secondary">{format(parseISO(t.date), "dd/MM/yyyy")}</td>
                    <td className="px-4 py-3">
                      <Badge variant={t.status === "completed" ? "success" : t.status === "pending" ? "warning" : "outline"}>
                        {t.status === "completed" ? "Concluída" : t.status === "pending" ? "Pendente" : "Agendada"}
                      </Badge>
                    </td>
                    <td
                      className={`px-4 py-3 text-right font-medium ${
                        t.type === "income" ? "text-success" : t.type === "expense" ? "text-destructive" : "text-text-primary"
                      }`}
                    >
                      {t.type === "expense" ? "-" : ""}
                      {formatCurrency(Number(t.amount))}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => {
                            setEditing(t);
                            setDialogOpen(true);
                          }}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button size="icon" variant="ghost" onClick={() => handleDelete(t.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
