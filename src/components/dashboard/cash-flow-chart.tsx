"use client";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";

export interface CashFlowPoint {
  label: string;
  income: number;
  expense: number;
}

export function CashFlowChart({ data }: { data: CashFlowPoint[] }) {
  const isEmpty = data.every((d) => d.income === 0 && d.expense === 0);

  return (
    <Card className="col-span-full lg:col-span-2">
      <CardHeader>
        <CardTitle>Fluxo de Caixa</CardTitle>
      </CardHeader>
      <CardContent className="h-72">
        {isEmpty ? (
          <div className="flex h-full items-center justify-center text-sm text-text-muted">
            Nenhuma movimentação registrada neste período.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ left: 0, right: 12, top: 10, bottom: 0 }}>
              <defs>
                <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(142 71% 45%)" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="hsl(142 71% 45%)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(0 72% 51%)" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="hsl(0 72% 51%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis dataKey="label" stroke="hsl(var(--text-muted))" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis
                stroke="hsl(var(--text-muted))"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => formatCompact(v)}
              />
              <Tooltip
                contentStyle={{
                  background: "hsl(var(--surface-elevated))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: 8,
                  color: "hsl(var(--text-primary))",
                }}
                formatter={(value) => formatCurrency(Number(value ?? 0))}
              />
              <Area type="monotone" dataKey="income" stroke="hsl(142 71% 45%)" fill="url(#incomeGradient)" name="Receitas" />
              <Area type="monotone" dataKey="expense" stroke="hsl(0 72% 51%)" fill="url(#expenseGradient)" name="Despesas" />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}

function formatCompact(v: number) {
  return new Intl.NumberFormat("pt-BR", { notation: "compact" }).format(v);
}
