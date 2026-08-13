"use client";

import { useMemo } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { format, parseISO, startOfMonth, subMonths } from "date-fns";
import { ptBR } from "date-fns/locale";

import { ChartAreaInteractive, type FinancialChartPoint } from "@/components/chart-area-interactive";
import { CategoryDonutChart, type CategorySlice } from "@/components/dashboard/category-donut-chart";
import { ActivityCharts } from "@/components/dashboard/activity-charts";
import { CategoryIcon } from "@/components/categories/category-icon";
import { SectionCards } from "@/components/section-cards";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useWorkspaceTable } from "@/hooks/use-workspace-table";
import { formatCurrency } from "@/lib/utils";
import type { Account, Category, Transaction } from "@/types";

const PALETTE = ["#8B5CF6", "#6D5B9E", "#A78BFA", "#52525B", "#7C6FA6", "#C4B5FD"];

export default function DashboardPage() {
  const { data: accounts, loading: accountsLoading, error: accountsError } = useWorkspaceTable<Account>("accounts");
  const { data: transactions, loading: txLoading, error: txError } = useWorkspaceTable<Transaction>("transactions", {
    orderBy: { column: "date", ascending: false },
  });
  const { data: categories } = useWorkspaceTable<Category>("categories");

  const loading = accountsLoading || txLoading;
  const error = accountsError || txError;
  const categoriesById = useMemo(() => new Map(categories.map((category) => [category.id, category])), [categories]);

  const totals = useMemo(() => {
    const income = transactions.filter((transaction) => transaction.type === "income").reduce((sum, transaction) => sum + Number(transaction.amount), 0);
    const expense = transactions.filter((transaction) => transaction.type === "expense").reduce((sum, transaction) => sum + Number(transaction.amount), 0);
    const balance = accounts.reduce((sum, account) => sum + Number(account.current_balance ?? 0), 0);
    return { income, expense, balance, net: income - expense };
  }, [transactions, accounts]);

  const cashFlowData: FinancialChartPoint[] = useMemo(() => {
    const months = Array.from({ length: 6 }, (_, index) => startOfMonth(subMonths(new Date(), 5 - index)));
    return months.map((monthStart) => {
      const monthTransactions = transactions.filter((transaction) => {
        const date = parseISO(transaction.date);
        return date.getFullYear() === monthStart.getFullYear() && date.getMonth() === monthStart.getMonth();
      });
      const label = format(monthStart, "MMM", { locale: ptBR });
      return {
        label: label.charAt(0).toUpperCase() + label.slice(1),
        income: monthTransactions.filter((transaction) => transaction.type === "income").reduce((sum, transaction) => sum + Number(transaction.amount), 0),
        expense: monthTransactions.filter((transaction) => transaction.type === "expense").reduce((sum, transaction) => sum + Number(transaction.amount), 0),
      };
    });
  }, [transactions]);

  const categoryData: CategorySlice[] = useMemo(() => {
    const totalsByCategory = new Map<string, number>();
    transactions.filter((transaction) => transaction.type === "expense").forEach((transaction) => {
      const category = transaction.category_id ? categoriesById.get(transaction.category_id) : undefined;
      const name = category?.name ?? "Sem categoria";
      totalsByCategory.set(name, (totalsByCategory.get(name) ?? 0) + Number(transaction.amount));
    });
    return Array.from(totalsByCategory.entries())
      .sort((left, right) => right[1] - left[1])
      .map(([name, value], index) => ({ name, value, color: PALETTE[index % PALETTE.length] }));
  }, [transactions, categoriesById]);

  if (loading) {
    return (
      <div className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }, (_, index) => <Skeleton key={index} className="h-40 rounded-xl" />)}
        </div>
        <Skeleton className="h-[410px] rounded-xl" />
      </div>
    );
  }

  const recentTransactions = transactions.slice(0, 8);

  return (
    <div className="mx-auto max-w-[1600px] space-y-5">
      <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-xl font-semibold tracking-[-0.025em] text-text-primary">Visão geral</h1>
          <p className="mt-1 text-sm text-text-muted">
            {format(new Date(), "MMMM 'de' yyyy", { locale: ptBR }).replace(/^\w/, (character) => character.toUpperCase())}
          </p>
        </div>
        <p className="text-xs text-text-muted">Dados consolidados do workspace atual</p>
      </div>

      {error && (
        <div className="rounded-lg border border-warning-border bg-warning-subtle p-4 text-sm text-warning">
          Não foi possível carregar dados do Supabase ({error}). Verifique se as credenciais foram configuradas.
        </div>
      )}

      <SectionCards balance={totals.balance} income={totals.income} expense={totals.expense} net={totals.net} />

      <ChartAreaInteractive data={cashFlowData} />

      <ActivityCharts transactions={transactions} />

      <div className="grid gap-5 lg:grid-cols-3">
        <Card className="overflow-hidden lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between space-y-0 border-b border-border-subtle">
            <div>
              <CardTitle>Transações recentes</CardTitle>
              <CardDescription className="mt-1">Últimas movimentações do workspace</CardDescription>
            </div>
            <Link href="/transactions" className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline">
              Ver todas <ArrowRight className="size-3" />
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            {recentTransactions.length === 0 ? (
              <p className="p-6 text-sm text-text-muted">Nenhuma transação registrada ainda.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead>Descrição</TableHead>
                    <TableHead className="hidden sm:table-cell">Categoria</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead className="text-right">Valor</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentTransactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell className="max-w-[190px]"><p className="truncate font-medium">{transaction.description}</p><p className="mt-1 truncate text-[10px] text-text-muted">Lançado por {transaction.created_by_name ?? "Usuário"}</p></TableCell>
                      <TableCell className="hidden sm:table-cell"><div className="flex items-center gap-2"><CategoryIcon name={transaction.category_id ? categoriesById.get(transaction.category_id)?.icon : undefined} className="size-3.5 text-primary"/><span className="max-w-28 truncate text-xs text-text-muted">{transaction.category_id ? categoriesById.get(transaction.category_id)?.name ?? "Sem categoria" : "Sem categoria"}</span></div></TableCell>
                      <TableCell className="text-xs text-text-muted">{format(parseISO(transaction.date), "dd/MM")}</TableCell>
                      <TableCell className={transaction.type === "expense" ? "text-right font-medium tabular-nums text-destructive" : "text-right font-medium tabular-nums text-success"}>
                        {transaction.type === "expense" ? "−" : "+"}{formatCurrency(Number(transaction.amount))}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <CategoryDonutChart data={categoryData} />
      </div>

      <Card>
        <CardHeader className="border-b border-border-subtle">
          <CardTitle>Contas</CardTitle>
          <CardDescription>Saldos consolidados por conta</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-px bg-border-subtle p-0 sm:grid-cols-2 xl:grid-cols-3">
          {accounts.length === 0 ? (
            <p className="bg-surface p-6 text-sm text-text-muted">Nenhuma conta cadastrada ainda.</p>
          ) : accounts.map((account) => (
            <div key={account.id} className="flex items-center justify-between bg-surface px-5 py-4">
              <div className="flex min-w-0 items-center gap-3">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-md border border-border bg-background text-xs font-semibold text-primary">{account.name.charAt(0).toUpperCase()}</span>
                <span className="truncate text-sm font-medium">{account.name}</span>
              </div>
              <span className={Number(account.current_balance ?? 0) >= 0 ? "ml-3 text-sm font-medium tabular-nums text-success" : "ml-3 text-sm font-medium tabular-nums text-destructive"}>
                {formatCurrency(Number(account.current_balance ?? 0))}
              </span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
