"use client";

import { useMemo } from "react";
import { addDays, format, isSameDay, parseISO, startOfDay, subDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import type { Transaction } from "@/types";

const TOOLTIP_STYLE = { background: "hsl(var(--surface-elevated))", border: "1px solid hsl(var(--border))", borderRadius: 12, color: "hsl(var(--text-primary))" };

export function ActivityCharts({ transactions }: { transactions: Transaction[] }) {
  const daily = useMemo(() => Array.from({ length: 7 }, (_, index) => startOfDay(subDays(new Date(), 6 - index))).map((day) => {
    const rows = transactions.filter((transaction) => isSameDay(parseISO(transaction.date), day));
    return { label: format(day, "EEE", { locale: ptBR }).replace(".", ""), receitas: sumType(rows, "income"), despesas: sumType(rows, "expense") };
  }), [transactions]);

  const balanceTrend = useMemo(() => {
    const firstDay = startOfDay(subDays(new Date(), 29));
    let running = 0;
    return Array.from({ length: 30 }, (_, index) => addDays(firstDay, index)).map((day) => {
      const rows = transactions.filter((transaction) => isSameDay(parseISO(transaction.date), day));
      running += sumType(rows, "income") - sumType(rows, "expense");
      return { label: format(day, "dd/MM"), saldo: running };
    });
  }, [transactions]);

  return <div className="grid gap-5 xl:grid-cols-2">
    <Card><CardHeader><CardTitle>Ritmo da semana</CardTitle><CardDescription>Receitas e despesas dos últimos 7 dias</CardDescription></CardHeader><CardContent className="h-64 px-2 pb-4 sm:px-5"><ResponsiveContainer width="100%" height="100%"><BarChart data={daily} margin={{ left: -20, right: 6 }}><CartesianGrid vertical={false} stroke="hsl(var(--border-subtle))"/><XAxis dataKey="label" axisLine={false} tickLine={false} fontSize={11}/><YAxis axisLine={false} tickLine={false} fontSize={10}/><Tooltip contentStyle={TOOLTIP_STYLE} formatter={(value) => formatCurrency(Number(value ?? 0))}/><Bar dataKey="receitas" fill="hsl(var(--success))" radius={[5,5,0,0]}/><Bar dataKey="despesas" fill="hsl(var(--primary))" radius={[5,5,0,0]}/></BarChart></ResponsiveContainer></CardContent></Card>
    <Card><CardHeader><CardTitle>Saldo acumulado</CardTitle><CardDescription>Evolução líquida dos últimos 30 dias</CardDescription></CardHeader><CardContent className="h-64 px-2 pb-4 sm:px-5"><ResponsiveContainer width="100%" height="100%"><AreaChart data={balanceTrend} margin={{ left: -20, right: 6 }}><defs><linearGradient id="balance-fill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.45}/><stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0.02}/></linearGradient></defs><CartesianGrid vertical={false} stroke="hsl(var(--border-subtle))"/><XAxis dataKey="label" axisLine={false} tickLine={false} fontSize={10} interval={5}/><YAxis axisLine={false} tickLine={false} fontSize={10}/><Tooltip contentStyle={TOOLTIP_STYLE} formatter={(value) => formatCurrency(Number(value ?? 0))}/><Area type="monotone" dataKey="saldo" stroke="hsl(var(--primary))" strokeWidth={2} fill="url(#balance-fill)"/></AreaChart></ResponsiveContainer></CardContent></Card>
  </div>;
}

function sumType(rows: Transaction[], type: Transaction["type"]) {
  return rows.filter((row) => row.type === type).reduce((total, row) => total + Number(row.amount), 0);
}
