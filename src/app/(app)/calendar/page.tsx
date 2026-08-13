"use client";
import { useMemo, useState } from "react";
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  format,
  isSameDay,
  isSameMonth,
  parseISO,
  startOfMonth,
  startOfWeek,
  endOfWeek,
  subMonths,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useWorkspaceTable } from "@/hooks/use-workspace-table";
import { cn, formatCurrency } from "@/lib/utils";
import type { Transaction } from "@/types";

export default function CalendarPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const { data: transactions, loading, error } = useWorkspaceTable<Transaction>("transactions");

  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(currentMonth), { weekStartsOn: 0 });
    const end = endOfWeek(endOfMonth(currentMonth), { weekStartsOn: 0 });
    return eachDayOfInterval({ start, end });
  }, [currentMonth]);

  const transactionsByDay = (day: Date) =>
    transactions.filter((t) => isSameDay(parseISO(t.date), day));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold capitalize text-text-primary">
          {format(currentMonth, "MMMM yyyy", { locale: ptBR })}
        </h2>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={() => setCurrentMonth((m) => subMonths(m, 1))}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={() => setCurrentMonth((m) => addMonths(m, 1))}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {error && (
        <div className="rounded-md border border-warning-border bg-warning-subtle p-4 text-sm text-warning">
          Não foi possível carregar eventos financeiros ({error}).
        </div>
      )}

      {loading ? (
        <Skeleton className="h-[500px] w-full" />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Eventos financeiros do mês</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-px overflow-hidden rounded-lg border border-border bg-border text-xs">
              {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map((d) => (
                <div key={d} className="bg-surface-elevated p-2 text-center font-medium text-text-muted">
                  {d}
                </div>
              ))}
              {days.map((day) => {
                const dayTx = transactionsByDay(day);
                const inMonth = isSameMonth(day, currentMonth);
                return (
                  <div
                    key={day.toISOString()}
                    className={cn(
                      "min-h-[96px] bg-surface p-2 align-top",
                      !inMonth && "opacity-40"
                    )}
                  >
                    <p className="mb-1 text-text-secondary">{format(day, "d")}</p>
                    <div className="space-y-1">
                      {dayTx.slice(0, 2).map((t) => (
                        <div
                          key={t.id}
                          className={cn(
                            "truncate rounded px-1.5 py-0.5 text-[11px]",
                            t.type === "income" ? "bg-success-subtle text-success" : "bg-destructive-subtle text-destructive"
                          )}
                        >
                          {t.description} · {formatCurrency(Number(t.amount))}
                        </div>
                      ))}
                      {dayTx.length > 2 && (
                        <p className="text-[11px] text-text-muted">+{dayTx.length - 2} mais</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
