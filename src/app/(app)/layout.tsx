"use client";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { TransactionDialog } from "@/components/transactions/transaction-dialog";
import { useUIStore } from "@/stores/ui-store";
import { usePathname } from "next/navigation";

const TITLES: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/calendar": "Calendário",
  "/transactions": "Transações",
  "/accounts": "Contas",
  "/cards": "Cartões",
  "/categories": "Categorias",
  "/recurrences": "Recorrências",
  "/subscriptions": "Assinaturas",
  "/cash-flow": "Fluxo de Caixa",
  "/reports": "Relatórios",
  "/channels": "Canais",
  "/settings": "Configurações",
};

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isQuickAddOpen = useUIStore((s) => s.isQuickAddOpen);
  const quickAddType = useUIStore((s) => s.quickAddType);
  const closeQuickAdd = useUIStore((s) => s.closeQuickAdd);

  const title = TITLES[pathname ?? ""] ?? "Spending Flows";

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex min-h-screen flex-1 flex-col">
        <Header title={title} />
        <main className="scrollbar-thin flex-1 overflow-y-auto p-6">{children}</main>
      </div>
      <TransactionDialog
        open={isQuickAddOpen}
        onOpenChange={(open) => !open && closeQuickAdd()}
        defaultType={quickAddType}
      />
    </div>
  );
}
