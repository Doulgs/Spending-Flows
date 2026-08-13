"use client";
import { useEffect, useState } from "react";
import { LockKeyhole, LogOut, Palette, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/use-toast";
import { signOut } from "@/features/auth/actions";
import { useCurrentUser } from "@/hooks/use-current-user";
import { createClient } from "@/lib/supabase/client";
import { useWorkspaceStore } from "@/stores/workspace-store";
import { AccentColorPicker } from "@/components/workspaces/accent-color-picker";
import { applyAccentTheme, isValidAccentColor, normalizeAccentColor } from "@/lib/theme";

export default function SettingsPage() {
  const { toast } = useToast();
  const { currentWorkspaceId, workspaces, setWorkspaces } = useWorkspaceStore();
  const currentWorkspace = workspaces.find((w) => w.id === currentWorkspaceId);
  const [name, setName] = useState(currentWorkspace?.name ?? "");
  const [currency, setCurrency] = useState(currentWorkspace?.currency ?? "BRL");
  const [accentColor, setAccentColor] = useState(currentWorkspace?.accent_color ?? "#8B5CF6");
  const { user, loading: userLoading } = useCurrentUser();
  const [saving, setSaving] = useState(false);
  const canEditWorkspace = Boolean(currentWorkspace && currentWorkspace.owner_id === user?.id);

  useEffect(() => {
    setName(currentWorkspace?.name ?? "");
    setCurrency(currentWorkspace?.currency ?? "BRL");
    setAccentColor(currentWorkspace?.accent_color ?? "#8B5CF6");
  }, [currentWorkspace]);

  const handleSave = async () => {
    if (!currentWorkspaceId || !isValidAccentColor(accentColor)) return;
    setSaving(true);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("workspaces")
        .update({ name, currency, accent_color: normalizeAccentColor(accentColor) })
        .eq("id", currentWorkspaceId);
      if (error) throw error;
      const normalizedAccent = normalizeAccentColor(accentColor);
      setWorkspaces(workspaces.map((w) => (w.id === currentWorkspaceId ? { ...w, name, currency, accent_color: normalizedAccent } : w)));
      applyAccentTheme(document.documentElement, normalizedAccent);
      toast({ title: "Configurações salvas com sucesso." });
    } catch (err) {
      toast({
        title: "Não foi possível salvar as configurações",
        description: err instanceof Error ? err.message : undefined,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (userLoading) return <div className="max-w-3xl space-y-6"><Skeleton className="h-64 rounded-xl" /><Skeleton className="h-[480px] rounded-xl" /></div>;

  return (
    <div className="max-w-3xl space-y-6">
      <Card>
        <CardHeader>
          <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-primary-subtle text-primary"><UserRound className="h-5 w-5" /></div>
          <CardTitle>Perfil</CardTitle>
          <CardDescription>Informações da sua conta</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>E-mail</Label>
            <Input value={user?.email ?? "—"} disabled />
          </div>
          <Separator />
          <Button variant="outline" onClick={() => signOut()}>
            <LogOut className="h-4 w-4" /> Sair da conta
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-primary-subtle text-primary"><Palette className="h-5 w-5" /></div>
          <CardTitle>Workspace e aparência</CardTitle>
          <CardDescription>Configurações gerais do workspace atual</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Nome</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} disabled={!canEditWorkspace} />
          </div>
          <div className="space-y-2">
            <Label>Moeda</Label>
            <Select value={currency} onValueChange={setCurrency}>
              <SelectTrigger disabled={!canEditWorkspace}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="BRL">Real (BRL)</SelectItem>
                <SelectItem value="USD">Dólar (USD)</SelectItem>
                <SelectItem value="EUR">Euro (EUR)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Separator />
          <AccentColorPicker value={accentColor} onChange={setAccentColor} disabled={!canEditWorkspace} />
          {currentWorkspace && currentWorkspace.owner_id !== user?.id && <div className="flex items-center gap-2 rounded-xl border border-border bg-surface-elevated p-3 text-xs text-text-muted"><LockKeyhole className="h-4 w-4" /> Somente o proprietário pode alterar a identidade visual deste workspace.</div>}
          <Button onClick={handleSave} disabled={saving || !canEditWorkspace || !isValidAccentColor(accentColor)}>
            Salvar alterações
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
