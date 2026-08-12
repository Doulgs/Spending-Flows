"use client";
import { useState } from "react";
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
import type { Card as CreditCard } from "@/types";

export default function CardsPage() {
  const { data: cards, loading, error, refresh } = useWorkspaceTable<CreditCard>("cards", {
    orderBy: { column: "created_at", ascending: true },
  });
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<CreditCard | null>(null);

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
        <div className="rounded-md border border-warning/30 bg-warning/10 p-4 text-sm text-warning">
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
            const used = Number((card as unknown as { used_amount?: number }).used_amount ?? 0);
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
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/15 text-primary">
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
