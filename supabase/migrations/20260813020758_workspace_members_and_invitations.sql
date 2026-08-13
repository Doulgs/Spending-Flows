create schema if not exists private;

-- Normalize the original broad roles to the two explicit collaboration modes.
alter table public.workspace_members drop constraint if exists workspace_members_role_check;
update public.workspace_members set role = 'editor' where role = 'admin';
update public.workspace_members set role = 'viewer' where role = 'member';
alter table public.workspace_members
  add constraint workspace_members_role_check
  check (role in ('owner', 'editor', 'viewer'));
alter table public.workspace_members alter column role set default 'viewer';

create or replace function private.can_manage_workspace(ws_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.workspace_members wm
    where wm.workspace_id = ws_id
      and wm.user_id = (select auth.uid())
      and wm.role in ('owner', 'editor')
  ) or exists (
    select 1
    from public.workspaces w
    where w.id = ws_id
      and w.owner_id = (select auth.uid())
  );
$$;

revoke all on function private.can_manage_workspace(uuid) from public;
grant execute on function private.can_manage_workspace(uuid) to authenticated, service_role;

create table public.workspace_invitations (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  email text not null check (email = lower(email) and email ~ '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$'),
  role text not null check (role in ('editor', 'viewer')),
  invited_by uuid not null references auth.users(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'accepted', 'revoked')),
  expires_at timestamptz not null default (now() + interval '7 days'),
  accepted_at timestamptz,
  created_at timestamptz not null default now()
);

create index workspace_invitations_workspace_idx on public.workspace_invitations(workspace_id);
create index workspace_invitations_email_idx on public.workspace_invitations(email);
create unique index workspace_invitations_pending_unique
  on public.workspace_invitations(workspace_id, email)
  where status = 'pending';

alter table public.workspace_invitations enable row level security;
grant select, insert, update, delete on public.workspace_invitations to authenticated;

create policy "Managers can view workspace invitations"
on public.workspace_invitations for select
to authenticated
using ((select private.can_manage_workspace(workspace_id)));

create policy "Managers can create workspace invitations"
on public.workspace_invitations for insert
to authenticated
with check (
  (select private.can_manage_workspace(workspace_id))
  and invited_by = (select auth.uid())
);

create policy "Managers can update workspace invitations"
on public.workspace_invitations for update
to authenticated
using ((select private.can_manage_workspace(workspace_id)))
with check ((select private.can_manage_workspace(workspace_id)));

create policy "Managers can delete workspace invitations"
on public.workspace_invitations for delete
to authenticated
using ((select private.can_manage_workspace(workspace_id)));

-- Replace the initial broad member policies with explicit read/manage behavior.
drop policy if exists "Members are insertable by workspace owner or admins" on public.workspace_members;
drop policy if exists "Members are deletable by workspace members" on public.workspace_members;

create policy "Managers can insert workspace members"
on public.workspace_members for insert
to authenticated
with check (
  (select private.can_manage_workspace(workspace_id))
  and role <> 'owner'
);

create policy "Managers can update workspace members"
on public.workspace_members for update
to authenticated
using ((select private.can_manage_workspace(workspace_id)) and role <> 'owner')
with check ((select private.can_manage_workspace(workspace_id)) and role in ('editor', 'viewer'));

create policy "Managers or self can remove workspace members"
on public.workspace_members for delete
to authenticated
using (
  role <> 'owner'
  and (
    user_id = (select auth.uid())
    or (select private.can_manage_workspace(workspace_id))
  )
);

-- Viewer can read workspace data. Editor and owner can mutate it.
drop policy if exists "Accounts are accessible by workspace members" on public.accounts;
drop policy if exists "Cards are accessible by workspace members" on public.cards;
drop policy if exists "Categories are accessible by workspace members" on public.categories;
drop policy if exists "Transactions are accessible by workspace members" on public.transactions;
drop policy if exists "Recurrences are accessible by workspace members" on public.recurrences;
drop policy if exists "Subscriptions are accessible by workspace members" on public.subscriptions;
drop policy if exists "Channels are accessible by workspace members" on public.channels;

do $$
declare
  table_name text;
begin
  foreach table_name in array array['accounts', 'cards', 'categories', 'transactions', 'recurrences', 'subscriptions', 'channels']
  loop
    execute format(
      'create policy %I on public.%I for select to authenticated using ((select private.is_workspace_member(workspace_id)))',
      table_name || ' are readable by workspace members',
      table_name
    );
    execute format(
      'create policy %I on public.%I for insert to authenticated with check ((select private.can_manage_workspace(workspace_id)))',
      table_name || ' are insertable by managers',
      table_name
    );
    execute format(
      'create policy %I on public.%I for update to authenticated using ((select private.can_manage_workspace(workspace_id))) with check ((select private.can_manage_workspace(workspace_id)))',
      table_name || ' are updatable by managers',
      table_name
    );
    execute format(
      'create policy %I on public.%I for delete to authenticated using ((select private.can_manage_workspace(workspace_id)))',
      table_name || ' are deletable by managers',
      table_name
    );
  end loop;
end $$;

-- Accepts only an authenticated user whose verified JWT email matches the invite.
-- It also guarantees that a first-time invitee owns a personal default workspace.
create or replace function public.accept_workspace_invitation(invitation_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  invitation public.workspace_invitations%rowtype;
  default_workspace_id uuid;
  current_user_id uuid := (select auth.uid());
  current_email text := lower(coalesce((select auth.jwt() ->> 'email'), ''));
begin
  if current_user_id is null or current_email = '' then
    raise exception 'authentication_required';
  end if;

  select * into invitation
  from public.workspace_invitations wi
  where wi.id = invitation_id
  for update;

  if invitation.id is null then
    raise exception 'invitation_not_found';
  end if;
  if invitation.status <> 'pending' then
    raise exception 'invitation_not_pending';
  end if;
  if invitation.expires_at <= now() then
    raise exception 'invitation_expired';
  end if;
  if invitation.email <> current_email then
    raise exception 'invitation_email_mismatch';
  end if;

  select w.id into default_workspace_id
  from public.workspaces w
  where w.owner_id = current_user_id
  order by w.created_at
  limit 1;

  if default_workspace_id is null then
    insert into public.workspaces (owner_id, name, type, currency, accent_color)
    values (current_user_id, 'Meu workspace', 'personal', 'BRL', '#8B5CF6')
    returning id into default_workspace_id;

    insert into public.workspace_members (workspace_id, user_id, role)
    values (default_workspace_id, current_user_id, 'owner')
    on conflict (workspace_id, user_id) do update set role = 'owner';
  end if;

  insert into public.workspace_members (workspace_id, user_id, role)
  values (invitation.workspace_id, current_user_id, invitation.role)
  on conflict (workspace_id, user_id) do update
    set role = case
      when public.workspace_members.role = 'owner' then 'owner'
      when excluded.role = 'editor' then 'editor'
      else public.workspace_members.role
    end;

  update public.workspace_invitations
  set status = 'accepted', accepted_at = now()
  where id = invitation.id;

  return jsonb_build_object(
    'workspace_id', invitation.workspace_id,
    'default_workspace_id', default_workspace_id
  );
end;
$$;

revoke all on function public.accept_workspace_invitation(uuid) from public, anon;
grant execute on function public.accept_workspace_invitation(uuid) to authenticated;

create or replace function public.list_workspace_members(ws_id uuid)
returns table (
  id uuid,
  user_id uuid,
  email text,
  display_name text,
  avatar_url text,
  role text,
  created_at timestamptz
)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if not private.can_manage_workspace(ws_id) then
    raise exception 'workspace_manager_required';
  end if;

  return query
  select
    wm.id,
    wm.user_id,
    au.email::text,
    coalesce(au.raw_user_meta_data ->> 'full_name', au.raw_user_meta_data ->> 'name', split_part(au.email, '@', 1))::text,
    coalesce(au.raw_user_meta_data ->> 'avatar_url', au.raw_user_meta_data ->> 'picture')::text,
    wm.role,
    wm.created_at
  from public.workspace_members wm
  join auth.users au on au.id = wm.user_id
  where wm.workspace_id = ws_id
  order by case wm.role when 'owner' then 0 when 'editor' then 1 else 2 end, wm.created_at;
end;
$$;

revoke all on function public.list_workspace_members(uuid) from public, anon;
grant execute on function public.list_workspace_members(uuid) to authenticated;
