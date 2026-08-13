"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Crown, Eye, Loader2, MailPlus, MoreHorizontal, ShieldCheck, UserMinus, UsersRound } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { createClient } from "@/lib/supabase/client";
import { useWorkspaceStore } from "@/stores/workspace-store";
import type { WorkspaceInvitation } from "@/types/database";

type MemberRow = {
  avatar_url: string | null;
  created_at: string;
  display_name: string;
  email: string;
  id: string;
  role: string;
  user_id: string;
};

export default function MembersPage() {
  const workspace = useWorkspaceStore((state) => state.currentWorkspace());
  const [members, setMembers] = useState<MemberRow[]>([]);
  const [invitations, setInvitations] = useState<WorkspaceInvitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [canManage, setCanManage] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!workspace) return;
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data: ownMembership } = await supabase.from("workspace_members").select("role").eq("workspace_id", workspace.id).eq("user_id", user.id).maybeSingle();
    const manager = workspace.owner_id === user.id || ownMembership?.role === "owner" || ownMembership?.role === "editor";
    setCanManage(manager);
    if (!manager) { setLoading(false); return; }

    const [{ data: memberData, error: memberError }, { data: invitationData, error: invitationError }] = await Promise.all([
      supabase.rpc("list_workspace_members", { ws_id: workspace.id }),
      supabase.from("workspace_invitations").select("*").eq("workspace_id", workspace.id).eq("status", "pending").order("created_at", { ascending: false }),
    ]);
    if (memberError || invitationError) setError(memberError?.message ?? invitationError?.message ?? "Não foi possível carregar os membros.");
    else {
      setMembers((memberData as MemberRow[]) ?? []);
      setInvitations((invitationData as WorkspaceInvitation[]) ?? []);
    }
    setLoading(false);
  }, [workspace]);

  useEffect(() => { void load(); }, [load]);

  async function updateRole(member: MemberRow, role: "editor" | "viewer") {
    const supabase = createClient();
    const { error: updateError } = await supabase.from("workspace_members").update({ role }).eq("id", member.id);
    if (updateError) setError(updateError.message); else await load();
  }

  async function removeMember(member: MemberRow) {
    const supabase = createClient();
    const { error: removeError } = await supabase.from("workspace_members").delete().eq("id", member.id);
    if (removeError) setError(removeError.message); else await load();
  }

  async function revokeInvitation(invitation: WorkspaceInvitation) {
    const supabase = createClient();
    const { error: revokeError } = await supabase.from("workspace_invitations").update({ status: "revoked" }).eq("id", invitation.id);
    if (revokeError) setError(revokeError.message); else await load();
  }

  const editors = useMemo(() => members.filter((member) => member.role !== "viewer").length, [members]);

  if (!workspace) return <Skeleton className="h-80 rounded-xl" />;

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div><p className="font-mono text-[10px] uppercase tracking-[.24em] text-primary">Workspace access</p><h1 className="font-display mt-2 text-3xl font-semibold tracking-[-.04em]">Pessoas e permissões</h1><p className="mt-2 text-sm text-muted-foreground">Gerencie quem pode visualizar ou alterar os dados de {workspace.name}.</p></div>
        {canManage && <InviteDialog workspaceId={workspace.id} onInvited={load} />}
      </div>

      {!canManage && !loading && <Card className="border-amber-500/20 bg-amber-500/[.06]"><CardContent className="flex gap-4 p-6"><Eye className="size-5 text-amber-300"/><div><p className="font-medium">Acesso somente para visualização</p><p className="mt-1 text-sm text-muted-foreground">Apenas proprietários e membros com permissão para gerenciar podem alterar a equipe.</p></div></CardContent></Card>}
      {error && <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">{error}</div>}

      {canManage && <>
        <div className="grid gap-4 sm:grid-cols-3">
          <Metric label="Membros ativos" value={members.length} detail="Pessoas com acesso" icon={UsersRound} />
          <Metric label="Podem gerenciar" value={editors} detail="Owner e editores" icon={ShieldCheck} />
          <Metric label="Convites pendentes" value={invitations.length} detail="Expiram em 7 dias" icon={MailPlus} />
        </div>

        <Card className="overflow-hidden">
          <CardHeader className="border-b border-border"><CardTitle>Membros do workspace</CardTitle><CardDescription>As permissões são aplicadas pelo banco e pela interface.</CardDescription></CardHeader>
          <CardContent className="p-0">
            {loading ? <div className="space-y-px">{Array.from({ length: 3 }, (_, index) => <Skeleton key={index} className="h-20 rounded-none" />)}</div> : members.map((member) => (
              <div key={member.id} className="group flex flex-wrap items-center gap-3 border-b border-border px-4 py-4 last:border-0 hover:bg-muted/30 sm:flex-nowrap sm:gap-4 sm:px-5">
                <Avatar className="size-10 rounded-lg"><AvatarImage src={member.avatar_url ?? undefined}/><AvatarFallback className="rounded-lg bg-primary/10 text-xs text-primary">{initials(member.display_name)}</AvatarFallback></Avatar>
                <div className="min-w-0 flex-1 basis-[calc(100%-4rem)] sm:basis-auto"><p className="truncate text-sm font-medium">{member.display_name}</p><p className="truncate text-xs text-muted-foreground">{member.email}</p></div>
                <RoleBadge role={member.role} />
                <span className="hidden text-xs text-muted-foreground md:block">Desde {formatDistanceToNow(new Date(member.created_at), { locale: ptBR })}</span>
                {member.role === "owner" ? <Crown className="size-4 text-amber-300" /> : <DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal /></Button></DropdownMenuTrigger><DropdownMenuContent align="end"><DropdownMenuItem onClick={() => updateRole(member, "editor")}><ShieldCheck className="mr-2 size-4"/>Permitir gerenciar</DropdownMenuItem><DropdownMenuItem onClick={() => updateRole(member, "viewer")}><Eye className="mr-2 size-4"/>Somente visualizar</DropdownMenuItem><DropdownMenuSeparator/><DropdownMenuItem className="text-destructive" onClick={() => removeMember(member)}><UserMinus className="mr-2 size-4"/>Remover acesso</DropdownMenuItem></DropdownMenuContent></DropdownMenu>}
              </div>
            ))}
          </CardContent>
        </Card>

        {invitations.length > 0 && <Card className="overflow-hidden"><CardHeader className="border-b border-border"><CardTitle>Convites pendentes</CardTitle><CardDescription>Pessoas que ainda não aceitaram o acesso.</CardDescription></CardHeader><CardContent className="p-0">{invitations.map((invitation) => <div key={invitation.id} className="flex flex-wrap items-center gap-3 border-b border-border px-4 py-4 last:border-0 sm:flex-nowrap sm:gap-4 sm:px-5"><div className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-border bg-muted"><MailPlus className="size-4 text-muted-foreground"/></div><div className="min-w-0 flex-1 basis-[calc(100%-4rem)] sm:basis-auto"><p className="truncate text-sm font-medium">{invitation.email}</p><p className="text-xs text-muted-foreground">Enviado {formatDistanceToNow(new Date(invitation.created_at), { addSuffix: true, locale: ptBR })}</p></div><RoleBadge role={invitation.role}/><Button variant="ghost" size="sm" className="ml-auto text-muted-foreground" onClick={() => revokeInvitation(invitation)}>Revogar</Button></div>)}</CardContent></Card>}
      </>}
    </div>
  );
}

function InviteDialog({ workspaceId, onInvited }: { workspaceId: string; onInvited: () => Promise<void> }) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"editor" | "viewer">("viewer");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  async function invite() {
    setLoading(true); setError(null);
    try {
      const response = await fetch("/api/workspace-invitations", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, role, workspaceId }) });
      const payload = await response.json() as { error?: string };
      if (!response.ok) throw new Error(payload.error ?? "Não foi possível enviar o convite.");
      setOpen(false); setEmail(""); setRole("viewer"); await onInvited();
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Não foi possível enviar o convite."); }
    finally { setLoading(false); }
  }
  return <Dialog open={open} onOpenChange={setOpen}><DialogTrigger asChild><Button><MailPlus/>Convidar membro</Button></DialogTrigger><DialogContent><DialogHeader><DialogTitle>Convidar para o workspace</DialogTitle><DialogDescription>Um link seguro será enviado por e-mail. Novos usuários recebem também um workspace pessoal.</DialogDescription></DialogHeader><div className="space-y-5 pt-3"><div className="space-y-2"><Label htmlFor="member-email">E-mail</Label><Input id="member-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="pessoa@empresa.com"/></div><div className="space-y-2"><Label>Permissão</Label><Select value={role} onValueChange={(value) => setRole(value as "editor" | "viewer")}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent><SelectItem value="editor">Permitir gerenciar</SelectItem><SelectItem value="viewer">Apenas visualizar</SelectItem></SelectContent></Select><p className="text-xs leading-5 text-muted-foreground">Gerenciar permite criar, editar e excluir dados. Visualizar mantém tudo em modo leitura.</p></div>{error && <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">{error}</div>}<Button className="w-full" disabled={loading || !email} onClick={invite}>{loading && <Loader2 className="animate-spin"/>}Enviar convite</Button></div></DialogContent></Dialog>;
}

function Metric({ label, value, detail, icon: Icon }: { label: string; value: number; detail: string; icon: React.ComponentType<{ className?: string }> }) { return <Card><CardContent className="p-5"><div className="flex items-start justify-between"><div><p className="text-xs text-muted-foreground">{label}</p><p className="mt-2 text-3xl font-semibold tabular-nums">{value}</p><p className="mt-4 text-xs text-muted-foreground">{detail}</p></div><div className="flex size-9 items-center justify-center rounded-lg border border-border bg-muted/40"><Icon className="size-4 text-primary"/></div></div></CardContent></Card>; }
function RoleBadge({ role }: { role: string }) { const label = role === "owner" ? "Proprietário" : role === "editor" ? "Pode gerenciar" : "Somente leitura"; return <Badge variant="outline" className={role === "viewer" ? "text-muted-foreground" : "border-primary/25 bg-primary/[.07] text-primary"}>{label}</Badge>; }
function initials(value: string) { return value.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase(); }
