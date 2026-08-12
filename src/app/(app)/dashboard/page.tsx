"use client";
import { useMemo } from "react";
import { ArrowDownRight, ArrowUpRight, Scale, Wallet } from "lucide-react";
import { format, parseISO, startOfMonth, subMonths } from "date-fns";
import { ptBR } from "date-fns/locale";

import { StatCard } from "@/components/dashboard/stat-card";
import { CashFlowChart, type CashFlowPoint } from "@/components/dashboard/cash-flow-chart";
import { CategoryDonutChart, type CategorySlice } from "@/components/dashboard/category-donut-chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useWorkspaceTable } from "@/hooks/use-workspace-table";
import { formatCurrency } from "@/lib/utils";
import type { Account, Category, Transaction } from "@/types";

const PALETTE = ["#A179FA", "#8D67F2", "#D6C3FA", "#3D2C76", "#AE87FB", "#EADEFC"];

export default function DashboardPage() {
  const { data: accounts, loading: accountsLoading, error: accountsError } = useWorkspaceTable<Account>("accounts");
  const {
    data: transactions,
    loading: txLoading,
    error: txError,
  } = useWorkspaceTable<Transaction>("transactions", { orderBy: { column: "date", ascending: false } });
  const { data: categories } = useWorkspaceTable<Category>("categories");

  const loading = accountsLoading || txLoading;
  const error = accountsError || txError;

  const totals = useMemo(() => {
    const income = transactions.filter((t) => t.type === "income").reduce((s, t) => s + Number(t.amount), 0);
    const expense = transactions.filter((t) => t.type === "expense").reduce((s, t) => s + Number(t.amount), 0);
    const balance = accounts.reduce((s, a) => s + Number(a.current_balance ?? 0), 0);
    return { income, expense, balance, net: income - expense };
  }, [transactions, accounts]);

  const cashFlowData: CashFlowPoint[] = useMemo(() => {
    const months = Array.from({ length: 6 }).map((_, i) => startOfMonth(subMonths(new Date(), 5 - i)));
    return months.map((monthStart) => {
      const label = format(monthStart, "MMM", { locale: ptBR });
      const monthTx = transactions.filter((t) => {
        const d = parseISO(t.date);
        return d.getFullYear() === monthStart.getFullYear() && d.getMonth() === monthStart.getMonth();
      });
      return {
        label: label.charAt(0).toUpperCase() + label.slice(1),
        income: monthTx.filter((t) => t.type === "income").reduce((s, t) => s + Number(t.amount), 0),
        expense: monthTx.filter((t) => t.type === "expense").reduce((s, t) => s + Number(t.amount), 0),
      };
    });
  }, [transactions]);

  const categoryData: CategorySlice[] = useMemo(() => {
    const byCategory = new Map<string, number>();
    transactions
      .filter((t) => t.type === "expense")
      .forEach((t) => {
        const cat = categories.find((c) => c.id === t.category_id);
        const name = cat?.name ?? "Sem categoria";
        byCategory.set(name, (byCategory.get(name) ?? 0) + Number(t.amount));
      });
    return Array.from(byCategory.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([name, value], i) => ({ name, value, color: PALETTE[i % PALETTE.length] }));
  }, [transactions, categories]);

  const recentTransactions = transactions.slice(0, 6);

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-28" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-md border border-warning/30 bg-warning/10 p-4 text-sm text-warning">
          Não foi possível carregar dados do Supabase ({error}). Verifique se as credenciais foram configuradas.
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Saldo total" value={formatCurrency(totals.balance)} icon={Wallet} accent="primary" />
        <StatCard label="Receitas" value={formatCurrency(totals.income)} icon={ArrowUpRight} accent="success" />
        <StatCard label="Despesas" value={formatCurrency(totals.expense)} icon={ArrowDownRight} accent="destructive" />
        <StatCard
          label="Fluxo líquido"
          value={formatCurrency(totals.net)}
          icon={Scale}
          accent={totals.net >= 0 ? "success" : "destructive"}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <CashFlowChart data={cashFlowData} />
        <CategoryDonutChart data={categoryData} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Transações recentes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentTransactions.length === 0 && (
              <p className="text-sm text-text-muted">Nenhuma transação registrada ainda.</p>
            )}
            {recentTransactions.map((t) => (
              <div key={t.id} className="flex items-center justify-between border-b border-border pb-3 last:border-0 last:pb-0">
                <div>
                  <p className="text-sm font-medium text-text-primary">{t.description}</p>
                  <p className="text-xs text-text-muted">{format(parseISO(t.date), "dd/MM/yyyy")}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={t.type === "income" ? "success" : t.type === "expense" ? "destructive" : "outline"}>
                    {t.type === "income" ? "Receita" : t.type === "expense" ? "Despesa" : "Transferência"}
                  </Badge>
                  <span
                    className={
                      t.type === "income" ? "text-success font-medium" : t.type === "expense" ? "text-destructive font-medium" : "text-text-primary font-medium"
                    }
                  >
                    {formatCurrency(Number(t.amount))}
                  </span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Saldo por conta</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {accounts.length === 0 && <p className="text-sm text-text-muted">Nenhuma conta cadastrada ainda.</p>}
            {accounts.map((a) => (
              <div key={a.id} className="flex items-center justify-between border-b border-border pb-3 last:border-0 last:pb-0">
                <p className="text-sm font-medium text-text-primary">{a.name}</p>
                <span className="font-medium text-text-primary">{formatCurrency(Number(a.current_balance ?? 0))}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
