"use client";
import { useEffect, useState } from "react";
import { LogOut } from "lucide-react";
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
import { useToast } from "@/components/ui/use-toast";
import { signOut } from "@/features/auth/actions";
import { createClient } from "@/lib/supabase/client";
import { useWorkspaceStore } from "@/stores/workspace-store";

export default function SettingsPage() {
  const { toast } = useToast();
  const { currentWorkspaceId, workspaces, setWorkspaces } = useWorkspaceStore();
  const currentWorkspace = workspaces.find((w) => w.id === currentWorkspaceId);
  const [name, setName] = useState(currentWorkspace?.name ?? "");
  const [currency, setCurrency] = useState(currentWorkspace?.currency ?? "BRL");
  const [email, setEmail] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setName(currentWorkspace?.name ?? "");
    setCurrency(currentWorkspace?.currency ?? "BRL");
  }, [currentWorkspace]);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? null));
  }, []);

  const handleSave = async () => {
    if (!currentWorkspaceId) return;
    setSaving(true);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("workspaces")
        .update({ name, currency })
        .eq("id", currentWorkspaceId);
      if (error) throw error;
      setWorkspaces(workspaces.map((w) => (w.id === currentWorkspaceId ? { ...w, name, currency } : w)));
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

  return (
    <div className="max-w-2xl space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Perfil</CardTitle>
          <CardDescription>Informações da sua conta</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>E-mail</Label>
            <Input value={email ?? "—"} disabled />
          </div>
          <Separator />
          <Button variant="outline" onClick={() => signOut()}>
            <LogOut className="h-4 w-4" /> Sair da conta
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Workspace</CardTitle>
          <CardDescription>Configurações gerais do workspace atual</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Nome</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} disabled={!currentWorkspaceId} />
          </div>
          <div className="space-y-2">
            <Label>Moeda</Label>
            <Select value={currency} onValueChange={setCurrency}>
              <SelectTrigger disabled={!currentWorkspaceId}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="BRL">Real (BRL)</SelectItem>
                <SelectItem value="USD">Dólar (USD)</SelectItem>
                <SelectItem value="EUR">Euro (EUR)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button onClick={handleSave} disabled={saving || !currentWorkspaceId}>
            Salvar alterações
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
