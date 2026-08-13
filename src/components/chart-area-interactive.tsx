"use client";

import { useMemo, useState } from "react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { formatCurrency } from "@/lib/utils";

export type FinancialChartPoint = { label: string; income: number; expense: number };

const chartConfig = {
  income: { label: "Receitas", color: "hsl(var(--primary))" },
  expense: { label: "Despesas", color: "hsl(var(--chart-3))" },
} satisfies ChartConfig;

export function ChartAreaInteractive({ data }: { data: FinancialChartPoint[] }) {
  const [range, setRange] = useState("6m");
  const filtered = useMemo(() => range === "3m" ? data.slice(-3) : data, [data, range]);
  const empty = filtered.every((point) => point.income === 0 && point.expense === 0);
  return <Card className="premium-card overflow-hidden border-white/[0.075] shadow-none animate-fade-up [animation-delay:220ms]">
    <CardHeader className="relative flex-row items-start justify-between space-y-0 border-b border-white/[0.055]">
      <div><p className="font-mono text-[9px] uppercase tracking-[.22em] text-primary">Performance financeira</p><CardTitle className="mt-2 text-base">Entradas versus saídas</CardTitle><CardDescription className="mt-1">Comportamento mensal do caixa do workspace</CardDescription></div>
      <ToggleGroup type="single" value={range} onValueChange={(value) => value && setRange(value)} variant="outline" className="hidden sm:flex"><ToggleGroupItem value="6m" className="h-8 px-3 text-xs">6 meses</ToggleGroupItem><ToggleGroupItem value="3m" className="h-8 px-3 text-xs">3 meses</ToggleGroupItem></ToggleGroup>
    </CardHeader>
    <CardContent className="px-2 pb-4 pt-6 sm:px-5">
      {empty ? <div className="flex h-[320px] items-center justify-center text-sm text-muted-foreground">Registre movimentações para visualizar a evolução do caixa.</div> : <ChartContainer config={chartConfig} className="h-[320px] w-full aspect-auto">
        <AreaChart data={filtered} margin={{ left: 0, right: 12, top: 10 }}>
          <defs><linearGradient id="incomeArea" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="var(--color-income)" stopOpacity={.48}/><stop offset="95%" stopColor="var(--color-income)" stopOpacity={.015}/></linearGradient><linearGradient id="expenseArea" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="var(--color-expense)" stopOpacity={.25}/><stop offset="95%" stopColor="var(--color-expense)" stopOpacity={.01}/></linearGradient></defs>
          <CartesianGrid vertical={false} stroke="hsl(var(--border))" strokeOpacity={.7}/><XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={10}/><YAxis tickLine={false} axisLine={false} width={50} tickFormatter={(value) => new Intl.NumberFormat("pt-BR", { notation: "compact" }).format(value)}/>
          <ChartTooltip cursor={{ stroke: "hsl(var(--border-strong))" }} content={<ChartTooltipContent indicator="line" formatter={(value) => formatCurrency(Number(value))}/>}/>
          <Area dataKey="expense" type="natural" fill="url(#expenseArea)" stroke="var(--color-expense)" strokeWidth={1.4}/><Area dataKey="income" type="natural" fill="url(#incomeArea)" stroke="var(--color-income)" strokeWidth={2}/>
        </AreaChart>
      </ChartContainer>}
    </CardContent>
  </Card>;
}
