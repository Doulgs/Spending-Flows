"use client";
import { useState } from "react";
import { Pencil, Plus, Tag, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { CategoryDialog } from "@/components/forms/category-dialog";
import { useWorkspaceTable } from "@/hooks/use-workspace-table";
import { createClient } from "@/lib/supabase/client";
import type { Category } from "@/types";

export default function CategoriesPage() {
  const { data: categories, loading, error, refresh } = useWorkspaceTable<Category>("categories", {
    orderBy: { column: "name", ascending: true },
  });
  const { toast } = useToast();
  const [tab, setTab] = useState<"expense" | "income">("expense");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);

  const filtered = categories.filter((c) => c.type === tab);

  const handleDelete = async (id: string) => {
    try {
      const supabase = createClient();
      const { error: delError } = await supabase.from("categories").delete().eq("id", id);
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
        <Tabs value={tab} onValueChange={(v) => setTab(v as "expense" | "income")}>
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

      {error && (
        <div className="rounded-md border border-warning-border bg-warning-subtle p-4 text-sm text-warning">
          Não foi possível carregar as categorias ({error}).
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>{tab === "expense" ? "Categorias de despesa" : "Categorias de receita"}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)
          ) : filtered.length === 0 ? (
            <p className="py-6 text-center text-sm text-text-muted">Nenhuma categoria cadastrada.</p>
          ) : (
            filtered.map((c) => (
              <div
                key={c.id}
                className="flex items-center justify-between rounded-md border border-border px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <span
                    className="flex h-8 w-8 items-center justify-center rounded-lg"
                    style={{ backgroundColor: `${c.color ?? "#A179FA"}26`, color: c.color ?? "#A179FA" }}
                  >
                    <Tag className="h-4 w-4" />
                  </span>
                  <span className="text-sm font-medium text-text-primary">{c.name}</span>
                </div>
                <div className="flex gap-1">
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => {
                      setEditing(c);
                      setDialogOpen(true);
                    }}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button size="icon" variant="ghost" onClick={() => handleDelete(c.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

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
