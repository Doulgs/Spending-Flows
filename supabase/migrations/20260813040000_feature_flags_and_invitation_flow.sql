create table public.feature_flags (
  id uuid primary key default gen_random_uuid(),
  key text not null unique check (key ~ '^[a-z][a-z0-9_]*$'),
  name text not null,
  description text,
  enabled boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.account_feature_flags (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references auth.users(id) on delete cascade,
  feature_flag_id uuid not null references public.feature_flags(id) on delete cascade,
  enabled boolean not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (account_id, feature_flag_id)
);

create index account_feature_flags_flag_idx
  on public.account_feature_flags(feature_flag_id);

alter table public.feature_flags enable row level security;
alter table public.account_feature_flags enable row level security;

grant select on public.feature_flags to anon, authenticated;
grant select on public.account_feature_flags to authenticated;

create policy "Feature flags are readable"
on public.feature_flags for select
to anon, authenticated
using (true);

create policy "Users can read their feature flag overrides"
on public.account_feature_flags for select
to authenticated
using (account_id = (select auth.uid()));

insert into public.feature_flags (key, name, description, enabled)
values
  ('email_signup', 'Cadastro por e-mail', 'Permite criar uma conta usando e-mail e senha.', true),
  ('onboarding', 'Onboarding', 'Exibe o fluxo guiado de configuração inicial.', true);

create or replace function public.is_feature_enabled(flag_key text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(
    (
      select aff.enabled
      from public.account_feature_flags aff
      join public.feature_flags ff on ff.id = aff.feature_flag_id
      where ff.key = flag_key
        and aff.account_id = (select auth.uid())
      limit 1
    ),
    (
      select ff.enabled
      from public.feature_flags ff
      where ff.key = flag_key
      limit 1
    ),
    false
  );
$$;

revoke all on function public.is_feature_enabled(text) from public;
grant execute on function public.is_feature_enabled(text) to anon, authenticated, service_role;

create or replace function public.ensure_default_workspace()
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := (select auth.uid());
  default_workspace_id uuid;
begin
  if current_user_id is null then
    raise exception 'authentication_required';
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

    insert into public.accounts (
      workspace_id,
      name,
      type,
      initial_balance,
      current_balance,
      currency
    )
    values (
      default_workspace_id,
      'Conta Principal',
      'checking',
      0,
      0,
      'BRL'
    );
  end if;

  return default_workspace_id;
end;
$$;

revoke all on function public.ensure_default_workspace() from public, anon;
grant execute on function public.ensure_default_workspace() to authenticated;

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
  current_email text;
begin
  if current_user_id is null then
    raise exception 'authentication_required';
  end if;

  select lower(coalesce(
    (select auth.jwt() ->> 'email'),
    (select au.email from auth.users au where au.id = current_user_id),
    ''
  )) into current_email;

  if current_email = '' then
    raise exception 'invitation_email_unavailable';
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
  if lower(invitation.email) <> current_email then
    raise exception 'invitation_email_mismatch';
  end if;

  default_workspace_id := public.ensure_default_workspace();

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
