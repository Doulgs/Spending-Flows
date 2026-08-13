"use client";

import { useMemo, useState } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

import { CategoryIcon } from "@/components/categories/category-icon";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn, formatCurrency } from "@/lib/utils";
import type { Category, Transaction } from "@/types";

interface CategoryBreakdownCardProps {
  categories: Category[];
  transactions: Transaction[];
  type: "expense" | "income";
  loading?: boolean;
}

interface CategoryBreakdownSlice {
  id: string;
  name: string;
  value: number;
  color: string;
  icon: string | null;
}

const MONTHS = [
  "janeiro",
  "fevereiro",
  "março",
  "abril",
  "maio",
  "junho",
  "julho",
  "agosto",
  "setembro",
  "outubro",
  "novembro",
  "dezembro",
];

export function CategoryBreakdownCard({
  categories,
  transactions,
  type,
  loading = false,
}: CategoryBreakdownCardProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const { slices, total, period } = useMemo(() => {
    const categoryIds = new Set(categories.map((category) => category.id));
    const totals = new Map<string, number>();
    const matchingTransactions = transactions.filter(
      (transaction) =>
        transaction.type === type &&
        transaction.category_id &&
        categoryIds.has(transaction.category_id),
    );

    matchingTransactions.forEach((transaction) => {
      const categoryId = transaction.category_id as string;
      totals.set(
        categoryId,
        (totals.get(categoryId) ?? 0) + Number(transaction.amount),
      );
    });

    const nextSlices = categories
      .map((category) => ({
        id: category.id,
        name: category.name,
        value: totals.get(category.id) ?? 0,
        color: category.color ?? "#8B5CF6",
        icon: category.icon,
      }))
      .filter((category) => category.value > 0)
      .sort((a, b) => b.value - a.value);

    return {
      slices: nextSlices,
      total: nextSlices.reduce((sum, category) => sum + category.value, 0),
      period: getPeriodLabel(matchingTransactions),
    };
  }, [categories, transactions, type]);

  const selected =
    slices.find((slice) => slice.id === selectedId) ?? slices[0] ?? null;
  const selectedPercentage =
    selected && total > 0 ? (selected.value / total) * 100 : 0;

  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex-row items-start justify-between gap-4 space-y-0 p-7 pb-4 sm:p-8 sm:pb-5">
        <div className="min-w-0">
          <h2 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
            Categorias de {type === "expense" ? "despesa" : "receita"}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground sm:text-base">
            {period}
          </p>
        </div>
        {selected && (
          <span className="flex max-w-36 shrink-0 items-center gap-2 rounded-full border border-border-strong bg-surface-elevated px-3 py-1.5 text-xs font-medium text-foreground shadow-sm">
            <CategoryIcon name={selected.icon} className="size-3.5" />
            <span className="truncate">{selected.name}</span>
          </span>
        )}
      </CardHeader>

      <CardContent className="p-0 sm:p-0">
        <div className="px-5 pb-8 pt-8 sm:px-8 sm:pb-9 sm:pt-10">
          {loading ? (
            <div className="mx-auto size-56 animate-pulse rounded-full border-[22px] border-surface-elevated" />
          ) : (
            <div className="relative mx-auto size-56 sm:size-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={
                      slices.length
                        ? slices
                        : [
                            {
                              id: "empty",
                              name: "Sem dados",
                              value: 1,
                              color: "hsl(var(--surface-hover))",
                              icon: null,
                            },
                          ]
                    }
                    dataKey="value"
                    nameKey="name"
                    innerRadius="70%"
                    outerRadius="88%"
                    paddingAngle={slices.length > 1 ? 2 : 0}
                    stroke="transparent"
                    onClick={(slice: CategoryBreakdownSlice) => {
                      if (slice.id !== "empty") setSelectedId(slice.id);
                    }}
                  >
                    {(slices.length
                      ? slices
                      : [{ id: "empty", color: "hsl(var(--surface-hover))" }]
                    ).map((slice) => (
                      <Cell
                        key={slice.id}
                        fill={slice.color}
                        className={cn(
                          "cursor-pointer outline-none transition-opacity",
                          selected &&
                            selected.id !== slice.id &&
                            "opacity-45 hover:opacity-80",
                        )}
                      />
                    ))}
                  </Pie>
                  {slices.length > 0 && (
                    <Tooltip
                      cursor={false}
                      contentStyle={{
                        background: "hsl(var(--popover))",
                        border: "1px solid hsl(var(--border-strong))",
                        borderRadius: 8,
                        color: "hsl(var(--foreground))",
                        boxShadow: "0 18px 45px rgba(0, 0, 0, .35)",
                        fontSize: 12,
                      }}
                      formatter={(value) => formatCurrency(Number(value ?? 0))}
                    />
                  )}
                </PieChart>
              </ResponsiveContainer>
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="max-w-36 text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
                  {formatCurrency(total)}
                </span>
                <span className="mt-1 text-xs text-muted-foreground">
                  Total movimentado
                </span>
              </div>
            </div>
          )}

          <div className="mt-6 flex gap-2 overflow-x-auto pb-1 scrollbar-thin sm:flex-wrap sm:justify-center sm:overflow-visible">
            {slices.length > 0 ? (
              slices.map((slice) => (
                <button
                  key={slice.id}
                  type="button"
                  onClick={() => setSelectedId(slice.id)}
                  className={cn(
                    "flex min-h-9 shrink-0 items-center gap-2 rounded-full border px-3 text-xs transition-colors",
                    selected?.id === slice.id
                      ? "border-border-strong bg-surface-elevated text-foreground"
                      : "border-transparent text-muted-foreground hover:bg-surface-hover hover:text-foreground",
                  )}
                  aria-pressed={selected?.id === slice.id}
                >
                  <span
                    className="size-2 rounded-full"
                    style={{ backgroundColor: slice.color }}
                  />
                  {slice.name}
                </button>
              ))
            ) : (
              <p className="mx-auto py-2 text-sm text-muted-foreground">
                Registre movimentações categorizadas para visualizar a
                distribuição.
              </p>
            )}
          </div>
        </div>

        <div className="border-t border-border bg-surface-elevated px-5 py-6 sm:px-8">
          <div className="flex items-center justify-between gap-4">
            <div className="flex min-w-0 items-center gap-3">
              <span
                className="grid size-9 shrink-0 place-items-center rounded-md border border-white/5"
                style={{
                  backgroundColor: selected
                    ? `${selected.color}20`
                    : "hsl(var(--surface-hover))",
                  color: selected?.color ?? "hsl(var(--muted-foreground))",
                }}
              >
                <CategoryIcon name={selected?.icon} className="size-4" />
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-foreground">
                  {selected?.name ?? "Sem movimentações"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {selected
                    ? formatCurrency(selected.value)
                    : "Nenhuma categoria no período"}
                </p>
              </div>
            </div>
            <span className="shrink-0 text-lg font-medium tabular-nums text-muted-foreground">
              {formatPercentage(selectedPercentage)}
            </span>
          </div>
          <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-background">
            <div
              className="h-full rounded-full transition-[width,background-color] duration-500"
              style={{
                width: `${selectedPercentage}%`,
                backgroundColor: selected?.color ?? "hsl(var(--surface-hover))",
              }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function getPeriodLabel(transactions: Transaction[]) {
  if (transactions.length === 0) return "Todos os lançamentos";

  const dates = transactions
    .map((transaction) => transaction.date.slice(0, 10))
    .sort((a, b) => a.localeCompare(b));
  const first = formatMonthYear(dates[0]);
  const last = formatMonthYear(dates[dates.length - 1]);

  return first === last ? first : `${first} — ${last}`;
}

function formatMonthYear(value: string) {
  const [year, month] = value.split("-").map(Number);
  return `${MONTHS[month - 1] ?? "Período"} de ${year}`;
}

function formatPercentage(value: number) {
  return (
    new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 1 }).format(value) +
    "%"
  );
}
