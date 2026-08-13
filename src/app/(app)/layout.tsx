"use client";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { TransactionDialog } from "@/components/transactions/transaction-dialog";
import { useUIStore } from "@/stores/ui-store";
import { usePathname } from "next/navigation";
import { getPageTitle } from "@/components/layout/navigation";
import { WorkspaceThemeSync } from "@/components/layout/workspace-theme-sync";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isQuickAddOpen = useUIStore((s) => s.isQuickAddOpen);
  const quickAddType = useUIStore((s) => s.quickAddType);
  const closeQuickAdd = useUIStore((s) => s.closeQuickAdd);

  const title = getPageTitle(pathname);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <WorkspaceThemeSync />
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <Header title={title} />
        <main className="scrollbar-thin flex-1 overflow-y-auto px-4 py-5 sm:px-6 lg:px-8 lg:py-7">{children}</main>
      </div>
      <TransactionDialog
        open={isQuickAddOpen}
        onOpenChange={(open) => !open && closeQuickAdd()}
        defaultType={quickAddType}
      />
    </div>
  );
}
