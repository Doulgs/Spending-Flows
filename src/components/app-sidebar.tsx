"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ChevronsUpDown, LogOut, PlusCircle } from "lucide-react";
import { ANALYSIS_NAV_ITEMS, PRIMARY_NAV_ITEMS } from "@/components/layout/navigation";
import { WorkspaceSwitcher } from "@/components/layout/workspace-switcher";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { signOut } from "@/features/auth/actions";
import { useCurrentUser } from "@/hooks/use-current-user";
import { useWorkspacePermission } from "@/hooks/use-workspace-permission";
import { useUIStore } from "@/stores/ui-store";

type Item = (typeof PRIMARY_NAV_ITEMS)[number] | (typeof ANALYSIS_NAV_ITEMS)[number];

export function AppSidebar(props: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();
  const router = useRouter();
  const openQuickAdd = useUIStore((state) => state.openQuickAdd);
  const { displayName, avatarUrl, initials, user, loading: userLoading } = useCurrentUser();
  const { canManage, loading: permissionLoading } = useWorkspacePermission();

  return (
    <Sidebar collapsible="icon" variant="inset" {...props}>
      <SidebarHeader className="gap-3 p-3">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild size="lg" className="hover:bg-transparent active:bg-transparent">
              <Link href="/dashboard">
                <Image src="/favicon/apple-touch-icon.png" width={34} height={34} className="size-8 rounded-lg" alt="" priority />
                <div className="grid flex-1 text-left leading-tight"><span className="truncate text-sm font-semibold tracking-tight">Spending Flows</span><span className="truncate font-mono text-[9px] uppercase tracking-[.18em] text-muted-foreground">Command center</span></div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        <div className="group-data-[collapsible=icon]:hidden"><WorkspaceSwitcher /></div>
      </SidebarHeader>

      <SidebarContent>
        {!permissionLoading && canManage && <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={() => openQuickAdd("expense")} tooltip="Nova movimentação" className="bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground">
                  <PlusCircle /><span>Nova movimentação</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>}
        <Navigation label="Organização" items={PRIMARY_NAV_ITEMS} pathname={pathname} />
        <Navigation label="Inteligência" items={ANALYSIS_NAV_ITEMS} pathname={pathname} />
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            {userLoading ? <SidebarMenuButton size="lg" disabled><Skeleton className="size-8 rounded-lg" /><div className="grid flex-1 gap-1.5"><Skeleton className="h-3 w-24" /><Skeleton className="h-2.5 w-32" /></div></SidebarMenuButton> : <DropdownMenu>
              <DropdownMenuTrigger asChild><SidebarMenuButton size="lg" className="data-[state=open]:bg-sidebar-accent"><Avatar className="size-8 rounded-lg"><AvatarImage src={avatarUrl}/><AvatarFallback className="rounded-lg bg-primary/10 text-xs text-primary">{initials}</AvatarFallback></Avatar><div className="grid flex-1 text-left text-xs leading-tight"><span className="truncate font-medium">{displayName}</span><span className="truncate text-[10px] text-muted-foreground">{user?.email}</span></div><ChevronsUpDown className="ml-auto"/></SidebarMenuButton></DropdownMenuTrigger>
              <DropdownMenuContent side="right" align="end" className="w-56"><DropdownMenuItem onClick={() => router.push("/settings")}>Configurações</DropdownMenuItem><DropdownMenuSeparator/><DropdownMenuItem className="text-destructive" onClick={() => signOut()}><LogOut className="mr-2"/>Sair da conta</DropdownMenuItem></DropdownMenuContent>
            </DropdownMenu>}
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}

function Navigation({ label, items, pathname }: { label: string; items: readonly Item[]; pathname: string }) {
  return <SidebarGroup><SidebarGroupLabel>{label}</SidebarGroupLabel><SidebarGroupContent><SidebarMenu>{items.map((item) => { const Icon = item.icon; const related = item.href === "/accounts" ? "/cards" : item.href === "/subscriptions" ? "/recurrences" : item.href === "/cash-flow" ? "/reports" : null; const active = pathname === item.href || pathname.startsWith(`${item.href}/`) || pathname === related; return <SidebarMenuItem key={item.href}><SidebarMenuButton asChild isActive={active} tooltip={item.label}><Link href={item.href}><Icon/><span>{item.label}</span></Link></SidebarMenuButton></SidebarMenuItem>; })}</SidebarMenu></SidebarGroupContent></SidebarGroup>;
}
