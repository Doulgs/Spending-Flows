create schema if not exists private;

revoke all on schema private from public;
grant usage on schema private to anon, authenticated, service_role;

create or replace function private.is_workspace_member(ws_id uuid)
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
  );
$$;

revoke all on function private.is_workspace_member(uuid) from public;
grant execute on function private.is_workspace_member(uuid) to anon, authenticated, service_role;

create or replace function public.is_workspace_member(ws_id uuid)
returns boolean
language sql
stable
security invoker
set search_path = ''
as $$
  select private.is_workspace_member(ws_id);
$$;

revoke all on function public.is_workspace_member(uuid) from public;
grant execute on function public.is_workspace_member(uuid) to anon, authenticated, service_role;
