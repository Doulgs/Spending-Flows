"use client";
import { useState } from "react";
import { ArrowLeftRight, Landmark, Pencil, PiggyBank, Plus, Trash2, Wallet } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/use-toast";
import { AccountDialog } from "@/components/accounts/account-dialog";
import { TransferDialog } from "@/components/accounts/transfer-dialog";
import { useWorkspaceTable } from "@/hooks/use-workspace-table";
import { createClient } from "@/lib/supabase/client";
import { formatCurrency } from "@/lib/utils";
import type { Account } from "@/types";

const ACCOUNT_ICONS: Record<string, typeof Wallet> = {
  checking: Landmark,
  savings: PiggyBank,
  cash: Wallet,
  investment: Landmark,
  other: Wallet,
};

export default function AccountsPage() {
  const { data: accounts, loading, error, refresh } = useWorkspaceTable<Account>("accounts", {
    orderBy: { column: "created_at", ascending: true },
  });
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [transferOpen, setTransferOpen] = useState(false);
  const [editing, setEditing] = useState<Account | null>(null);

  const handleDelete = async (id: string) => {
    try {
      const supabase = createClient();
      const { error: delError } = await supabase.from("accounts").delete().eq("id", id);
      if (delError) throw delError;
      toast({ title: "Conta removida." });
      refresh();
    } catch (err) {
      toast({
        title: "Não foi possível remover a conta",
        description: err instanceof Error ? err.message : undefined,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap justify-end gap-3">
        <Button variant="outline" onClick={() => setTransferOpen(true)} disabled={accounts.length < 2}>
          <ArrowLeftRight className="h-4 w-4" /> Transferir
        </Button>
        <Button
          onClick={() => {
            setEditing(null);
            setDialogOpen(true);
          }}
        >
          <Plus className="h-4 w-4" /> Nova conta
        </Button>
      </div>

      {error && (
        <div className="rounded-md border border-warning-border bg-warning-subtle p-4 text-sm text-warning">
          Não foi possível carregar as contas ({error}).
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-36" />
          ))}
        </div>
      ) : accounts.length === 0 ? (
        <Card>
          <CardContent className="p-10 text-center text-sm text-text-muted">
            Nenhuma conta cadastrada. Crie sua primeira conta para começar a registrar transações.
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {accounts.map((account) => {
            const Icon = ACCOUNT_ICONS[account.type] ?? Wallet;
            return (
              <Card key={account.id}>
                <CardContent className="p-5">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-subtle text-primary">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-medium text-text-primary">{account.name}</p>
                        <p className="text-xs capitalize text-text-muted">{account.type}</p>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => {
                          setEditing(account);
                          setDialogOpen(true);
                        }}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="ghost" onClick={() => handleDelete(account.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <p className="mt-4 text-2xl font-semibold text-text-primary">
                    {formatCurrency(Number(account.current_balance ?? 0))}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <AccountDialog open={dialogOpen} onOpenChange={setDialogOpen} account={editing} onSaved={refresh} />
      <TransferDialog open={transferOpen} onOpenChange={setTransferOpen} accounts={accounts} onSaved={refresh} />
    </div>
  );
}
