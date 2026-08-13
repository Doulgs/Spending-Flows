"use client";
import { useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { CategoryBreakdownCard } from "@/components/categories/category-breakdown-card";
import { CategoryIcon } from "@/components/categories/category-icon";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { CategoryDialog } from "@/components/forms/category-dialog";
import { useWorkspaceTable } from "@/hooks/use-workspace-table";
import { createClient } from "@/lib/supabase/client";
import type { Category, Transaction } from "@/types";

export default function CategoriesPage() {
  const {
    data: categories,
    loading,
    error,
    refresh,
  } = useWorkspaceTable<Category>("categories", {
    orderBy: { column: "name", ascending: true },
  });
  const {
    data: transactions,
    loading: transactionsLoading,
    error: transactionsError,
  } = useWorkspaceTable<Transaction>("transactions", {
    orderBy: { column: "date", ascending: true },
  });
  const { toast } = useToast();
  const [tab, setTab] = useState<"expense" | "income">("expense");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);

  const filtered = categories.filter((c) => c.type === tab);

  const handleDelete = async (id: string) => {
    try {
      const supabase = createClient();
      const { error: delError } = await supabase
        .from("categories")
        .delete()
        .eq("id", id);
      if (delError) throw delError;
      toast({ title: "Categoria removida." });
      refresh();
    } catch (err) {
      toast({
        title: "Não foi possível remover a categoria",
        description: err instanceof Error ? err.message : undefined,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Tabs
          value={tab}
          onValueChange={(v) => setTab(v as "expense" | "income")}
        >
          <TabsList>
            <TabsTrigger value="expense">Despesas</TabsTrigger>
            <TabsTrigger value="income">Receitas</TabsTrigger>
          </TabsList>
        </Tabs>
        <Button
          onClick={() => {
            setEditing(null);
            setDialogOpen(true);
          }}
        >
          <Plus className="h-4 w-4" /> Nova categoria
        </Button>
      </div>

      {(error || transactionsError) && (
        <div className="rounded-md border border-warning-border bg-warning-subtle p-4 text-sm text-warning">
          Não foi possível carregar todos os dados ({error ?? transactionsError}
          ).
        </div>
      )}

      <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1.15fr)_minmax(22rem,.85fr)]">
        <CategoryBreakdownCard
          categories={filtered}
          transactions={transactions}
          type={tab}
          loading={loading || transactionsLoading}
        />

        <Card>
          <CardHeader className="border-b border-border-subtle">
            <CardTitle className="text-base">Gerenciar categorias</CardTitle>
            <p className="text-sm text-muted-foreground">
              Personalize nomes, cores e ícones usados nos lançamentos.
            </p>
          </CardHeader>
          <CardContent className="space-y-2 pt-5 sm:pt-6">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-14 w-full" />
              ))
            ) : filtered.length === 0 ? (
              <p className="py-8 text-center text-sm text-text-muted">
                Nenhuma categoria cadastrada.
              </p>
            ) : (
              filtered.map((c) => (
                <div
                  key={c.id}
                  className="group flex min-h-14 items-center justify-between rounded-lg border border-border-subtle bg-surface px-3 py-2 transition-colors hover:border-border-strong hover:bg-surface-elevated"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <span
                      className="grid size-9 shrink-0 place-items-center rounded-md border border-white/5"
                      style={{
                        backgroundColor: `${c.color ?? "#A179FA"}20`,
                        color: c.color ?? "#A179FA",
                      }}
                    >
                      <CategoryIcon name={c.icon} className="size-4" />
                    </span>
                    <span className="truncate text-sm font-medium text-text-primary">
                      {c.name}
                    </span>
                  </div>
                  <div className="flex shrink-0 gap-1">
                    <Button
                      size="icon"
                      variant="ghost"
                      aria-label={`Editar categoria ${c.name}`}
                      onClick={() => {
                        setEditing(c);
                        setDialogOpen(true);
                      }}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="hover:text-destructive"
                      aria-label={`Excluir categoria ${c.name}`}
                      onClick={() => handleDelete(c.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <CategoryDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        category={editing}
        defaultType={tab}
        onSaved={refresh}
      />
    </div>
  );
}
