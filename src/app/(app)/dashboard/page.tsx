"use client";
import { useMemo } from "react";
import Link from "next/link";
import { ArrowDownRight, ArrowUpRight, Scale, Wallet, ArrowRight } from "lucide-react";
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

const PALETTE = ["#A179FA", "#8D67F2", "#C4A2FF", "#D6C3FA", "#6B4DBF", "#E8D9FF"];

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

  const recentTransactions = transactions.slice(0, 8);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-2xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <Skeleton className="col-span-2 h-80 rounded-2xl" />
          <Skeleton className="h-80 rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-2xl border border-warning/30 bg-warning/10 p-4 text-sm text-warning">
          Não foi possível carregar dados do Supabase ({error}). Verifique se as credenciais foram configuradas.
        </div>
      )}

      {/* Overview header */}
      <div className="rounded-2xl border border-border/50 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-5">
        <p className="text-xs font-semibold uppercase tracking-widest text-text-muted">Visão Geral</p>
        <p className="mt-1 text-2xl font-bold text-text-primary">
          {format(new Date(), "MMMM 'de' yyyy", { locale: ptBR }).replace(/^\w/, (c) => c.toUpperCase())}
        </p>
      </div>

      {/* Stat cards */}
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

      {/* Charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <CashFlowChart data={cashFlowData} />
        <CategoryDonutChart data={categoryData} />
      </div>

      {/* Bottom section */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle>Transações Recentes</CardTitle>
              <Link href="/transactions" className="flex items-center gap-1 text-xs text-primary hover:underline">
                Ver todas <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {recentTransactions.length === 0 ? (
              <p className="px-6 pb-6 text-sm text-text-muted">Nenhuma transação registrada ainda.</p>
            ) : (
              <ul>
                {recentTransactions.map((t, idx) => (
                  <li
                    key={t.id}
                    className={`flex items-center justify-between px-6 py-3 transition-colors hover:bg-surface-elevated/30 ${idx !== recentTransactions.length - 1 ? "border-b border-border/40" : ""}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`flex h-8 w-8 items-center justify-center rounded-xl text-xs font-bold ${t.type === "income" ? "bg-success/15 text-success" : t.type === "expense" ? "bg-destructive/15 text-destructive" : "bg-primary/15 text-primary"}`}>
                        {t.type === "income" ? "+" : t.type === "expense" ? "−" : "⇄"}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-text-primary leading-tight">{t.description}</p>
                        <p className="text-xs text-text-muted">{format(parseISO(t.date), "dd/MM/yyyy")}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={t.type === "income" ? "success" : t.type === "expense" ? "destructive" : "outline"} className="text-[10px]">
                        {t.type === "income" ? "Receita" : t.type === "expense" ? "Despesa" : "Transf."}
                      </Badge>
                      <span className={`text-sm font-semibold tabular-nums ${t.type === "income" ? "text-success" : t.type === "expense" ? "text-destructive" : "text-text-primary"}`}>
                        {t.type === "expense" ? "-" : "+"}{formatCurrency(Number(t.amount))}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Saldo por Conta</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {accounts.length === 0 ? (
              <p className="px-6 pb-6 text-sm text-text-muted">Nenhuma conta cadastrada ainda.</p>
            ) : (
              <ul>
                {accounts.map((a, idx) => (
                  <li
                    key={a.id}
                    className={`flex items-center justify-between px-6 py-3.5 transition-colors hover:bg-surface-elevated/30 ${idx !== accounts.length - 1 ? "border-b border-border/40" : ""}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/15 text-xs font-bold text-primary">
                        {a.name.charAt(0).toUpperCase()}
                      </div>
                      <p className="text-sm font-medium text-text-primary">{a.name}</p>
                    </div>
                    <span className={`text-sm font-semibold tabular-nums ${Number(a.current_balance ?? 0) >= 0 ? "text-success" : "text-destructive"}`}>
                      {formatCurrency(Number(a.current_balance ?? 0))}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
