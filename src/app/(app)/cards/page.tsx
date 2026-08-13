"use client";
import { useEffect, useState } from "react";
import { addMonths, setDate, startOfDay } from "date-fns";
import { CreditCard as CardIcon, Pencil, Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/use-toast";
import { CardDialog } from "@/components/forms/card-dialog";
import { useWorkspaceTable } from "@/hooks/use-workspace-table";
import { createClient } from "@/lib/supabase/client";
import { formatCurrency } from "@/lib/utils";
import { useWorkspaceStore } from "@/stores/workspace-store";
import type { Card as CreditCard, Transaction } from "@/types";

/**
 * Computes the [start, end) bounds of the current open invoice cycle for a
 * card, based on its closing day. The cycle ends on the next occurrence of
 * `closingDay` and starts right after the previous occurrence.
 */
function getCurrentCycleRange(closingDay: number, today = new Date()) {
  const day = Math.min(Math.max(closingDay, 1), 28);
  let end = setDate(startOfDay(today), day);
  if (end <= today) {
    end = addMonths(end, 1);
  }
  const start = addMonths(end, -1);
  return { start, end };
}

export default function CardsPage() {
  const { data: cards, loading, error, refresh } = useWorkspaceTable<CreditCard>("cards", {
    orderBy: { column: "created_at", ascending: true },
  });
  const { toast } = useToast();
  const workspaceId = useWorkspaceStore((s) => s.currentWorkspaceId);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<CreditCard | null>(null);
  const [usageByCard, setUsageByCard] = useState<Record<string, number>>({});

  useEffect(() => {
    if (!workspaceId || cards.length === 0) {
      setUsageByCard({});
      return;
    }
    const activeWorkspaceId = workspaceId;
    let cancelled = false;
    async function loadUsage() {
      try {
        const supabase = createClient();
        const cardIds = cards.map((c) => c.id);
        const { data, error: txError } = await supabase
          .from("transactions")
          .select("*")
          .eq("workspace_id", activeWorkspaceId)
          .eq("type", "expense")
          .in("card_id", cardIds);
        if (txError) throw txError;
        const transactions = (data as Transaction[]) ?? [];
        const usage: Record<string, number> = {};
        for (const card of cards) {
          const { start, end } = getCurrentCycleRange(card.closing_day);
          usage[card.id] = transactions
            .filter((t) => t.card_id === card.id)
            .filter((t) => {
              const txDate = new Date(t.date);
              return txDate >= start && txDate < end;
            })
            .reduce((sum, t) => sum + Number(t.amount), 0);
        }
        if (!cancelled) setUsageByCard(usage);
      } catch {
        if (!cancelled) setUsageByCard({});
      }
    }
    loadUsage();
    return () => {
      cancelled = true;
    };
  }, [workspaceId, cards]);

  const handleDelete = async (id: string) => {
    try {
      const supabase = createClient();
      const { error: delError } = await supabase.from("cards").delete().eq("id", id);
      if (delError) throw delError;
      toast({ title: "Cartão removido." });
      refresh();
    } catch (err) {
      toast({
        title: "Não foi possível remover o cartão",
        description: err instanceof Error ? err.message : undefined,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button
          onClick={() => {
            setEditing(null);
            setDialogOpen(true);
          }}
        >
          <Plus className="h-4 w-4" /> Novo cartão
        </Button>
      </div>

      {error && (
        <div className="rounded-md border border-warning-border bg-warning-subtle p-4 text-sm text-warning">
          Não foi possível carregar os cartões ({error}).
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      ) : cards.length === 0 ? (
        <Card>
          <CardContent className="p-10 text-center text-sm text-text-muted">
            Nenhum cartão cadastrado. Adicione seus cartões de crédito para acompanhar limite e fatura.
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {cards.map((card) => {
            const used = usageByCard[card.id] ?? 0;
            const limit = Number(card.limit_amount ?? 0);
            const usagePct = limit > 0 ? Math.min(100, (used / limit) * 100) : 0;
            return (
              <Card key={card.id} className="overflow-hidden">
                <div
                  className="h-2"
                  style={{ backgroundColor: card.color ?? "#A179FA" }}
                />
                <CardContent className="p-5">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-subtle text-primary">
                        <CardIcon className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-medium text-text-primary">{card.name}</p>
                        <p className="text-xs uppercase text-text-muted">{card.brand}</p>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => {
                          setEditing(card);
                          setDialogOpen(true);
                        }}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="ghost" onClick={() => handleDelete(card.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="mt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-text-muted">Uso da fatura</span>
                      <span className="text-text-primary">
                        {formatCurrency(used)} / {formatCurrency(limit)}
                      </span>
                    </div>
                    <Progress value={usagePct} />
                  </div>

                  <div className="mt-4 flex justify-between text-xs text-text-muted">
                    <span>Fecha dia {card.closing_day}</span>
                    <span>Vence dia {card.due_day}</span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <CardDialog open={dialogOpen} onOpenChange={setDialogOpen} card={editing} onSaved={refresh} />
    </div>
  );
}
