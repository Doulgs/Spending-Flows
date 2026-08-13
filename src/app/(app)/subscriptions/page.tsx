"use client";
import { useState } from "react";
import { format, parseISO } from "date-fns";
import { Plus, Rss, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/use-toast";
import { SubscriptionDialog } from "@/components/forms/subscription-dialog";
import { useWorkspaceTable } from "@/hooks/use-workspace-table";
import { createClient } from "@/lib/supabase/client";
import { formatCurrency } from "@/lib/utils";
import type { Card as CreditCard, Subscription } from "@/types";
import { RECURRING_SECTIONS, SectionSwitcher } from "@/components/layout/section-switcher";

export default function SubscriptionsPage() {
  const { data: subscriptions, loading, error, refresh } = useWorkspaceTable<Subscription>("subscriptions", {
    orderBy: { column: "next_billing_date", ascending: true },
  });
  const { data: cards } = useWorkspaceTable<CreditCard>("cards");
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);

  const totalMonthly = subscriptions
    .filter((s) => s.frequency === "monthly")
    .reduce((sum, s) => sum + Number(s.amount), 0);

  const handleDelete = async (id: string) => {
    try {
      const supabase = createClient();
      const { error: delError } = await supabase.from("subscriptions").delete().eq("id", id);
      if (delError) throw delError;
      toast({ title: "Assinatura removida." });
      refresh();
    } catch (err) {
      toast({
        title: "Não foi possível remover a assinatura",
        description: err instanceof Error ? err.message : undefined,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <SectionSwitcher items={RECURRING_SECTIONS} />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-text-muted">
          Total mensal: <span className="font-semibold text-text-primary">{formatCurrency(totalMonthly)}</span>
        </p>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="h-4 w-4" /> Nova assinatura
        </Button>
      </div>

      {error && (
        <div className="rounded-md border border-warning-border bg-warning-subtle p-4 text-sm text-warning">
          Não foi possível carregar as assinaturas ({error}).
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
      ) : subscriptions.length === 0 ? (
        <Card>
          <CardContent className="p-10 text-center text-sm text-text-muted">
            Nenhuma assinatura cadastrada. Adicione seus serviços recorrentes como streaming e softwares.
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {subscriptions.map((s) => (
            <Card key={s.id}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-subtle text-primary">
                      <Rss className="h-5 w-5" />
                    </span>
                    <div>
                      <p className="font-medium text-text-primary">{s.name}</p>
                      <p className="text-xs text-text-muted">
                        Próxima cobrança: {format(parseISO(s.next_billing_date), "dd/MM/yyyy")}
                      </p>
                    </div>
                  </div>
                  <Button size="icon" variant="ghost" onClick={() => handleDelete(s.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <p className="mt-4 text-xl font-semibold text-text-primary">{formatCurrency(Number(s.amount))}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <SubscriptionDialog open={dialogOpen} onOpenChange={setDialogOpen} cards={cards} onSaved={refresh} />
    </div>
  );
}
