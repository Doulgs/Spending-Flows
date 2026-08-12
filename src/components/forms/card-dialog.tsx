"use client";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";

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
import { cardSchema, type CardInput } from "@/lib/validations/card";
import { useWorkspaceStore } from "@/stores/workspace-store";
import type { Card as CreditCard } from "@/types";

interface CardDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  card?: CreditCard | null;
  onSaved?: () => void;
}

export function CardDialog({ open, onOpenChange, card, onSaved }: CardDialogProps) {
  const { toast } = useToast();
  const currentWorkspaceId = useWorkspaceStore((s) => s.currentWorkspaceId);
  const [loading, setLoading] = useState(false);

  const form = useForm<CardInput>({
    resolver: zodResolver(cardSchema),
    defaultValues: {
      name: card?.name ?? "",
      brand: card?.brand ?? "visa",
      limit_amount: card?.limit_amount ?? 0,
      closing_day: card?.closing_day ?? 1,
      due_day: card?.due_day ?? 10,
      color: card?.color ?? "#A179FA",
    },
  });

  useEffect(() => {
    if (!open) return;
    form.reset({
      name: card?.name ?? "",
      brand: card?.brand ?? "visa",
      limit_amount: card?.limit_amount ?? 0,
      closing_day: card?.closing_day ?? 1,
      due_day: card?.due_day ?? 10,
      color: card?.color ?? "#A179FA",
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, card]);

  const onSubmit = async (values: CardInput) => {
    if (!currentWorkspaceId) {
      toast({ title: "Selecione um workspace antes de continuar.", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const supabase = createClient();
      const payload = {
        workspace_id: currentWorkspaceId,
        name: values.name,
        brand: values.brand,
        limit_amount: values.limit_amount,
        closing_day: values.closing_day,
        due_day: values.due_day,
        color: values.color,
      };
      if (card?.id) {
        const { error } = await supabase.from("cards").update(payload).eq("id", card.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("cards").insert(payload);
        if (error) throw error;
      }
      toast({ title: "Cartão salvo com sucesso." });
      onOpenChange(false);
      onSaved?.();
    } catch (err) {
      toast({
        title: "Não foi possível salvar o cartão",
        description: err instanceof Error ? err.message : undefined,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{card?.id ? "Editar cartão" : "Novo cartão"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Nubank" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="brand"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bandeira</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="visa">Visa</SelectItem>
                      <SelectItem value="mastercard">Mastercard</SelectItem>
                      <SelectItem value="amex">Amex</SelectItem>
                      <SelectItem value="elo">Elo</SelectItem>
                      <SelectItem value="other">Outra</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="limit_amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Limite</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="closing_day"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Dia de fechamento</FormLabel>
                    <FormControl>
                      <Input type="number" min={1} max={31} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="due_day"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Dia de vencimento</FormLabel>
                    <FormControl>
                      <Input type="number" min={1} max={31} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
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
