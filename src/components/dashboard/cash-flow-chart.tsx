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
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle>Fluxo de Caixa</CardTitle>
          <div className="flex items-center gap-4 text-xs text-text-muted">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-success" />
              Receitas
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-destructive" />
              Despesas
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="h-72">
        {isEmpty ? (
          <div className="flex h-full items-center justify-center text-sm text-text-muted">
            Nenhuma movimentação registrada neste período.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ left: 0, right: 4, top: 10, bottom: 0 }}>
              <defs>
                <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(155 65% 42%)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(155 65% 42%)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(0 70% 55%)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(0 70% 55%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border) / 0.5)" vertical={false} />
              <XAxis
                dataKey="label"
                stroke="hsl(var(--text-muted))"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                dy={6}
              />
              <YAxis
                stroke="hsl(var(--text-muted))"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => formatCompact(v)}
                width={48}
              />
              <Tooltip
                contentStyle={{
                  background: "hsl(var(--surface-elevated))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: 12,
                  color: "hsl(var(--text-primary))",
                  boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
                  fontSize: 12,
                }}
                formatter={(value, name) => [formatCurrency(Number(value ?? 0)), name]}
              />
              <Area
                type="monotone"
                dataKey="income"
                stroke="hsl(155 65% 42%)"
                strokeWidth={2}
                fill="url(#incomeGradient)"
                name="Receitas"
                dot={false}
                activeDot={{ r: 4, fill: "hsl(155 65% 42%)" }}
              />
              <Area
                type="monotone"
                dataKey="expense"
                stroke="hsl(0 70% 55%)"
                strokeWidth={2}
                fill="url(#expenseGradient)"
                name="Despesas"
                dot={false}
                activeDot={{ r: 4, fill: "hsl(0 70% 55%)" }}
              />
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
