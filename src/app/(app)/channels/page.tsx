"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Mail, MessageCircle, Plus, Radio as RadioIcon, Send, Trash2 } from "lucide-react";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/use-toast";
import { useWorkspaceTable } from "@/hooks/use-workspace-table";
import { createClient } from "@/lib/supabase/client";
import { useWorkspaceStore } from "@/stores/workspace-store";
import type { Channel } from "@/types";

const channelSchema = z.object({
  type: z.enum(["email", "whatsapp", "telegram", "sms"]),
  identifier: z.string().min(3, "Informe um identificador válido"),
});
type ChannelInput = z.infer<typeof channelSchema>;

const CHANNEL_ICONS: Record<string, typeof Mail> = {
  email: Mail,
  whatsapp: MessageCircle,
  telegram: Send,
  sms: RadioIcon,
};

export default function ChannelsPage() {
  const { data: channels, loading, error, refresh } = useWorkspaceTable<Channel>("channels");
  const { toast } = useToast();
  const currentWorkspaceId = useWorkspaceStore((s) => s.currentWorkspaceId);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const form = useForm<ChannelInput>({
    resolver: zodResolver(channelSchema),
    defaultValues: { type: "email", identifier: "" },
  });

  const onSubmit = async (values: ChannelInput) => {
    if (!currentWorkspaceId) {
      toast({ title: "Selecione um workspace antes de continuar.", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      const supabase = createClient();
      const { error: insertError } = await supabase.from("channels").insert({
        workspace_id: currentWorkspaceId,
        type: values.type,
        identifier: values.identifier,
        verified: false,
      });
      if (insertError) throw insertError;
      toast({ title: "Canal adicionado. Verifique-o para começar a receber notificações." });
      setDialogOpen(false);
      form.reset();
      refresh();
    } catch (err) {
      toast({
        title: "Não foi possível adicionar o canal",
        description: err instanceof Error ? err.message : undefined,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const supabase = createClient();
      const { error: delError } = await supabase.from("channels").delete().eq("id", id);
      if (delError) throw delError;
      toast({ title: "Canal removido." });
      refresh();
    } catch (err) {
      toast({
        title: "Não foi possível remover o canal",
        description: err instanceof Error ? err.message : undefined,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="h-4 w-4" /> Novo canal
        </Button>
      </div>

      {error && (
        <div className="rounded-md border border-warning-border bg-warning-subtle p-4 text-sm text-warning">
          Não foi possível carregar os canais ({error}).
        </div>
      )}

      <Card>
        <CardContent className="space-y-2 p-4">
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-14 w-full" />)
          ) : channels.length === 0 ? (
            <p className="py-6 text-center text-sm text-text-muted">
              Nenhum canal configurado. Adicione e-mail, WhatsApp, Telegram ou SMS para receber alertas.
            </p>
          ) : (
            channels.map((c) => {
              const Icon = CHANNEL_ICONS[c.type] ?? RadioIcon;
              return (
                <div key={c.id} className="flex items-center justify-between rounded-md border border-border px-4 py-3">
                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-subtle text-primary">
                      <Icon className="h-4 w-4" />
                    </span>
                    <div>
                      <p className="text-sm font-medium capitalize text-text-primary">{c.type}</p>
                      <p className="text-xs text-text-muted">{c.identifier}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs ${
                        c.verified ? "bg-success-subtle text-success" : "bg-warning-subtle text-warning"
                      }`}
                    >
                      {c.verified ? "Verificado" : "Pendente"}
                    </span>
                    <Button size="icon" variant="ghost" onClick={() => handleDelete(c.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Novo canal de notificação</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                        <SelectItem value="email">E-mail</SelectItem>
                        <SelectItem value="whatsapp">WhatsApp</SelectItem>
                        <SelectItem value="telegram">Telegram</SelectItem>
                        <SelectItem value="sms">SMS</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="identifier"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Identificador</FormLabel>
                    <FormControl>
                      <Input placeholder="email@exemplo.com ou telefone" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="button" variant="ghost" onClick={() => setDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={saving}>
                  {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                  Adicionar
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
