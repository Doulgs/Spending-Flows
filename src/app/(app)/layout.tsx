"use client";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { TransactionDialog } from "@/components/transactions/transaction-dialog";
import { useUIStore } from "@/stores/ui-store";
import { usePathname } from "next/navigation";
import { getPageTitle } from "@/components/layout/navigation";
import { WorkspaceThemeSync } from "@/components/layout/workspace-theme-sync";
import { FloatingQuickAdd } from "@/components/layout/floating-quick-add";
import { MobileBottomNav } from "@/components/layout/mobile-bottom-nav";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isQuickAddOpen = useUIStore((s) => s.isQuickAddOpen);
  const quickAddType = useUIStore((s) => s.quickAddType);
  const closeQuickAdd = useUIStore((s) => s.closeQuickAdd);

  const title = getPageTitle(pathname);

  return (
    <SidebarProvider className="h-svh overflow-hidden bg-sidebar">
      <WorkspaceThemeSync />
      <AppSidebar />
      <SidebarInset className="min-h-0 overflow-hidden border border-white/[0.07] bg-background shadow-[0_0_60px_rgba(0,0,0,.25)] md:my-2 md:mr-2">
        <SiteHeader title={title} />
        <main className="scrollbar-thin flex-1 overflow-y-auto px-4 pb-28 pt-4 sm:p-5 lg:p-6">{children}</main>
      </SidebarInset>
      <FloatingQuickAdd />
      <MobileBottomNav />
      <TransactionDialog
        open={isQuickAddOpen}
        onOpenChange={(open) => !open && closeQuickAdd()}
        defaultType={quickAddType}
      />
    </SidebarProvider>
  );
}
