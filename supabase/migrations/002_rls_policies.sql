-- Row Level Security policies for Spending Flows
alter table public.workspaces enable row level security;
alter table public.workspace_members enable row level security;
alter table public.accounts enable row level security;
alter table public.cards enable row level security;
alter table public.categories enable row level security;
alter table public.transactions enable row level security;
alter table public.recurrences enable row level security;
alter table public.subscriptions enable row level security;
alter table public.channels enable row level security;
alter table public.notifications enable row level security;

-- Helper: is the current user a member of the given workspace?
create or replace function public.is_workspace_member(ws_id uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.workspace_members wm
    where wm.workspace_id = ws_id and wm.user_id = auth.uid()
  );
$$;

revoke all on function public.is_workspace_member(uuid) from public, anon;
grant execute on function public.is_workspace_member(uuid) to authenticated, service_role;

-- Workspaces: owner or member can select; only owner can insert/update/delete
create policy "Workspaces are viewable by members" on public.workspaces
  for select using (owner_id = auth.uid() or public.is_workspace_member(id));

create policy "Workspaces are insertable by owner" on public.workspaces
  for insert with check (owner_id = auth.uid());

create policy "Workspaces are updatable by owner" on public.workspaces
  for update using (owner_id = auth.uid());

create policy "Workspaces are deletable by owner" on public.workspaces
  for delete using (owner_id = auth.uid());

-- Workspace members
create policy "Members are viewable by workspace members" on public.workspace_members
  for select using (public.is_workspace_member(workspace_id) or user_id = auth.uid());

create policy "Members are insertable by workspace owner or admins" on public.workspace_members
  for insert with check (
    exists (
      select 1 from public.workspaces w
      where w.id = workspace_id and w.owner_id = auth.uid()
    )
    or exists (
      select 1 from public.workspace_members wm
      where wm.workspace_id = workspace_id
        and wm.user_id = auth.uid()
        and wm.role in ('owner', 'admin')
    )
  );

create policy "Members are deletable by workspace members" on public.workspace_members
  for delete using (public.is_workspace_member(workspace_id));

-- Generic policy generator pattern applied to each workspace-scoped table
create policy "Accounts are accessible by workspace members" on public.accounts
  for all using (public.is_workspace_member(workspace_id)) with check (public.is_workspace_member(workspace_id));

create policy "Cards are accessible by workspace members" on public.cards
  for all using (public.is_workspace_member(workspace_id)) with check (public.is_workspace_member(workspace_id));

create policy "Categories are accessible by workspace members" on public.categories
  for all using (public.is_workspace_member(workspace_id)) with check (public.is_workspace_member(workspace_id));

create policy "Transactions are accessible by workspace members" on public.transactions
  for all using (public.is_workspace_member(workspace_id)) with check (public.is_workspace_member(workspace_id));

create policy "Recurrences are accessible by workspace members" on public.recurrences
  for all using (public.is_workspace_member(workspace_id)) with check (public.is_workspace_member(workspace_id));

create policy "Subscriptions are accessible by workspace members" on public.subscriptions
  for all using (public.is_workspace_member(workspace_id)) with check (public.is_workspace_member(workspace_id));

create policy "Channels are accessible by workspace members" on public.channels
  for all using (public.is_workspace_member(workspace_id)) with check (public.is_workspace_member(workspace_id));

-- Notifications: only the target user can see their own notifications
create policy "Notifications are viewable by their user" on public.notifications
  for select using (user_id = auth.uid());

create policy "Notifications are insertable by workspace members" on public.notifications
  for insert with check (public.is_workspace_member(workspace_id));

create policy "Notifications are updatable by their user" on public.notifications
  for update using (user_id = auth.uid());

create policy "Notifications are deletable by their user" on public.notifications
  for delete using (user_id = auth.uid());
