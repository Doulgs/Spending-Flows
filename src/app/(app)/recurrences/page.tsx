"use client";
import { useState } from "react";
import { format, parseISO } from "date-fns";
import { Plus, Repeat, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/use-toast";
import { RecurrenceDialog } from "@/components/forms/recurrence-dialog";
import { useWorkspaceTable } from "@/hooks/use-workspace-table";
import { createClient } from "@/lib/supabase/client";
import { formatCurrency } from "@/lib/utils";
import type { Category, Recurrence } from "@/types";

const FREQUENCY_LABEL: Record<string, string> = {
  daily: "Diária",
  weekly: "Semanal",
  monthly: "Mensal",
  yearly: "Anual",
};

export default function RecurrencesPage() {
  const { data: recurrences, loading, error, refresh } = useWorkspaceTable<Recurrence>("recurrences", {
    orderBy: { column: "next_occurrence", ascending: true },
  });
  const { data: categories } = useWorkspaceTable<Category>("categories");
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);

  const categoryName = (id: string | null) => categories.find((c) => c.id === id)?.name ?? "—";

  const handleDelete = async (id: string) => {
    try {
      const supabase = createClient();
      const { error: delError } = await supabase.from("recurrences").delete().eq("id", id);
      if (delError) throw delError;
      toast({ title: "Recorrência removida." });
      refresh();
    } catch (err) {
      toast({
        title: "Não foi possível remover a recorrência",
        description: err instanceof Error ? err.message : undefined,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="h-4 w-4" /> Nova recorrência
        </Button>
      </div>

      {error && (
        <div className="rounded-md border border-warning-border bg-warning-subtle p-4 text-sm text-warning">
          Não foi possível carregar as recorrências ({error}).
        </div>
      )}

      <Card>
        <CardContent className="space-y-2 p-4">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)
          ) : recurrences.length === 0 ? (
            <p className="py-6 text-center text-sm text-text-muted">Nenhuma recorrência cadastrada.</p>
          ) : (
            recurrences.map((r) => (
              <div key={r.id} className="flex items-center justify-between rounded-md border border-border px-4 py-3">
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-subtle text-primary">
                    <Repeat className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-sm font-medium text-text-primary">{r.description}</p>
                    <p className="text-xs text-text-muted">
                      {categoryName(r.category_id)} · {FREQUENCY_LABEL[r.frequency]} · Próxima:{" "}
                      {format(parseISO(r.next_occurrence), "dd/MM/yyyy")}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={r.type === "income" ? "success" : "destructive"}>
                    {r.type === "income" ? "+" : "-"}
                    {formatCurrency(Number(r.amount))}
                  </Badge>
                  <Button size="icon" variant="ghost" onClick={() => handleDelete(r.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <RecurrenceDialog open={dialogOpen} onOpenChange={setDialogOpen} categories={categories} onSaved={refresh} />
    </div>
  );
}
