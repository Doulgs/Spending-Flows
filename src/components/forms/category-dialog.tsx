"use client";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { CategoryIconPicker } from "@/components/categories/category-icon-picker";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { createClient } from "@/lib/supabase/client";
import { categorySchema, type CategoryInput } from "@/lib/validations/category";
import { useWorkspaceStore } from "@/stores/workspace-store";
import type { Category } from "@/types";

interface CategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category?: Category | null;
  defaultType?: "income" | "expense";
  onSaved?: () => void;
}

export function CategoryDialog({ open, onOpenChange, category, defaultType = "expense", onSaved }: CategoryDialogProps) {
  const { toast } = useToast();
  const currentWorkspaceId = useWorkspaceStore((s) => s.currentWorkspaceId);
  const [loading, setLoading] = useState(false);

  const form = useForm<CategoryInput>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: category?.name ?? "",
      type: category?.type ?? defaultType,
      color: category?.color ?? "#A179FA",
      icon: category?.icon ?? "Tag",
    },
  });

  useEffect(() => {
    if (!open) return;
    form.reset({
      name: category?.name ?? "",
      type: category?.type ?? defaultType,
      color: category?.color ?? "#A179FA",
      icon: category?.icon ?? "Tag",
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, category, defaultType]);

  const onSubmit = async (values: CategoryInput) => {
    if (!currentWorkspaceId) {
      toast({ title: "Selecione um workspace antes de continuar.", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const supabase = createClient();
      if (category?.id) {
        const { error } = await supabase
          .from("categories")
          .update({ name: values.name, type: values.type, color: values.color, icon: values.icon })
          .eq("id", category.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("categories").insert({
          workspace_id: currentWorkspaceId,
          name: values.name,
          type: values.type,
          color: values.color,
          icon: values.icon,
        });
        if (error) throw error;
      }
      toast({ title: "Categoria salva com sucesso." });
      onOpenChange(false);
      onSaved?.();
    } catch (err) {
      toast({
        title: "Não foi possível salvar a categoria",
        description: err instanceof Error ? err.message : undefined,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100%-1rem)] rounded-2xl sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{category?.id ? "Editar categoria" : "Nova categoria"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="icon"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ícone</FormLabel>
                  <FormControl><CategoryIconPicker value={field.value} onChange={field.onChange} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Alimentação" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="expense">Despesa</SelectItem>
                      <SelectItem value="income">Receita</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="color"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cor</FormLabel>
                  <FormControl>
                    <Input type="color" className="h-10 w-20 p-1" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                Salvar
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
