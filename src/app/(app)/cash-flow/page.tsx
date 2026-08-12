"use client";
import { useMemo } from "react";
import { format, parseISO, startOfMonth, subMonths } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useWorkspaceTable } from "@/hooks/use-workspace-table";
import { formatCurrency } from "@/lib/utils";
import type { Transaction } from "@/types";

export default function CashFlowPage() {
  const { data: transactions, loading, error } = useWorkspaceTable<Transaction>("transactions");

  const data = useMemo(() => {
    const months = Array.from({ length: 12 }).map((_, i) => startOfMonth(subMonths(new Date(), 11 - i)));
    return months.map((monthStart) => {
      const label = format(monthStart, "MMM/yy", { locale: ptBR });
      const monthTx = transactions.filter((t) => {
        const d = parseISO(t.date);
        return d.getFullYear() === monthStart.getFullYear() && d.getMonth() === monthStart.getMonth();
      });
      const income = monthTx.filter((t) => t.type === "income").reduce((s, t) => s + Number(t.amount), 0);
      const expense = monthTx.filter((t) => t.type === "expense").reduce((s, t) => s + Number(t.amount), 0);
      return { label, Receitas: income, Despesas: expense, Saldo: income - expense };
    });
  }, [transactions]);

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-md border border-warning/30 bg-warning/10 p-4 text-sm text-warning">
          Não foi possível carregar o fluxo de caixa ({error}).
        </div>
      )}

      {loading ? (
        <Skeleton className="h-[420px] w-full" />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Fluxo de Caixa (12 meses)</CardTitle>
          </CardHeader>
          <CardContent className="h-[420px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="label" stroke="hsl(var(--text-muted))" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="hsl(var(--text-muted))" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    background: "hsl(var(--surface-elevated))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: 8,
                    color: "hsl(var(--text-primary))",
                  }}
                  formatter={(value) => formatCurrency(Number(value ?? 0))}
                />
                <Legend />
                <Bar dataKey="Receitas" fill="hsl(142 71% 45%)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Despesas" fill="hsl(0 72% 51%)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Saldo" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
