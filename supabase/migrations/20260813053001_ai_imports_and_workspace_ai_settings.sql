create table public.workspace_ai_settings (
  workspace_id uuid primary key references public.workspaces(id) on delete cascade,
  provider text not null check (provider in ('openai', 'anthropic', 'deepseek', 'google_gemini', 'openrouter', 'github_models')),
  model text not null check (char_length(trim(model)) between 1 and 120),
  secret_id uuid not null unique,
  api_key_hint text not null,
  updated_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.ai_import_jobs (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  created_by uuid not null references auth.users(id) on delete cascade,
  provider text not null check (provider in ('openai', 'anthropic', 'deepseek', 'google_gemini', 'openrouter', 'github_models')),
  model text not null,
  file_name text not null,
  file_type text not null,
  status text not null default 'analyzing' check (status in ('analyzing', 'ready', 'applying', 'completed', 'failed')),
  options jsonb not null default '{}'::jsonb,
  analysis jsonb,
  error_message text,
  source_row_count integer not null default 0 check (source_row_count >= 0),
  created_by_ai boolean not null default true,
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

create index ai_import_jobs_workspace_created_idx
  on public.ai_import_jobs (workspace_id, created_at desc);

alter table public.accounts add column created_by_ai boolean not null default false;
alter table public.categories add column created_by_ai boolean not null default false;
alter table public.transactions add column created_by_ai boolean not null default false;
alter table public.subscriptions add column created_by_ai boolean not null default false;

comment on column public.accounts.created_by_ai is 'True when the row was created by an AI import.';
comment on column public.categories.created_by_ai is 'True when the row was created by an AI import.';
comment on column public.transactions.created_by_ai is 'True when the row was created by an AI import.';
comment on column public.subscriptions.created_by_ai is 'True when the row was created by an AI import.';

alter table public.workspace_ai_settings enable row level security;
alter table public.ai_import_jobs enable row level security;

grant select on public.workspace_ai_settings to authenticated;
grant select on public.ai_import_jobs to authenticated;

create policy "Owners can read AI settings metadata"
on public.workspace_ai_settings for select to authenticated
using (
  exists (
    select 1 from public.workspaces w
    where w.id = workspace_id and w.owner_id = (select auth.uid())
  )
);

create policy "Members can read their AI import jobs"
on public.ai_import_jobs for select to authenticated
using (
  created_by = (select auth.uid())
  and (select private.is_workspace_member(workspace_id))
);

create or replace function public.save_workspace_ai_setting(
  p_workspace_id uuid,
  p_provider text,
  p_model text,
  p_api_key text,
  p_updated_by uuid
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_secret_id uuid;
  normalized_key text := trim(p_api_key);
  secret_hint text;
begin
  if coalesce((select auth.jwt() ->> 'role'), '') <> 'service_role' then
    raise exception 'service_role_required';
  end if;
  if p_provider not in ('openai', 'anthropic', 'deepseek', 'google_gemini', 'openrouter', 'github_models') then
    raise exception 'invalid_ai_provider';
  end if;
  if char_length(trim(p_model)) not between 1 and 120 then
    raise exception 'invalid_ai_model';
  end if;
  if char_length(normalized_key) < 8 then
    raise exception 'invalid_api_key';
  end if;
  if not exists (
    select 1 from public.workspaces w
    where w.id = p_workspace_id and w.owner_id = p_updated_by
  ) then
    raise exception 'workspace_owner_required';
  end if;

  select s.secret_id into current_secret_id
  from public.workspace_ai_settings s
  where s.workspace_id = p_workspace_id
  for update;

  if current_secret_id is null then
    current_secret_id := vault.create_secret(
      normalized_key,
      'workspace_ai_' || p_workspace_id::text,
      'Workspace AI provider key',
      null
    );
  else
    perform vault.update_secret(
      current_secret_id,
      normalized_key,
      'workspace_ai_' || p_workspace_id::text,
      'Workspace AI provider key',
      null
    );
  end if;

  secret_hint := case
    when char_length(normalized_key) <= 8 then '••••••••'
    else left(normalized_key, 4) || '••••' || right(normalized_key, 4)
  end;

  insert into public.workspace_ai_settings (
    workspace_id, provider, model, secret_id, api_key_hint, updated_by, updated_at
  ) values (
    p_workspace_id, p_provider, trim(p_model), current_secret_id, secret_hint, p_updated_by, now()
  )
  on conflict (workspace_id) do update set
    provider = excluded.provider,
    model = excluded.model,
    secret_id = excluded.secret_id,
    api_key_hint = excluded.api_key_hint,
    updated_by = excluded.updated_by,
    updated_at = now();
end;
$$;

create or replace function public.get_workspace_ai_secret(p_workspace_id uuid)
returns table (provider text, model text, api_key text)
language plpgsql
security definer
set search_path = ''
as $$
begin
  if coalesce((select auth.jwt() ->> 'role'), '') <> 'service_role' then
    raise exception 'service_role_required';
  end if;

  return query
  select s.provider, s.model, d.decrypted_secret
  from public.workspace_ai_settings s
  join vault.decrypted_secrets d on d.id = s.secret_id
  where s.workspace_id = p_workspace_id;
end;
$$;

revoke all on function public.save_workspace_ai_setting(uuid, text, text, text, uuid) from public, anon, authenticated;
revoke all on function public.get_workspace_ai_secret(uuid) from public, anon, authenticated;
grant execute on function public.save_workspace_ai_setting(uuid, text, text, text, uuid) to service_role;
grant execute on function public.get_workspace_ai_secret(uuid) to service_role;

-- Authenticated inserts still receive the authenticated author. Service-role imports
-- may preserve the explicitly supplied actor while executing an atomic import.
create or replace function public.set_transaction_author()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := (select auth.uid());
begin
  if current_user_id is null then
    if new.created_by is null then
      raise exception 'transaction_author_required';
    end if;
    return new;
  end if;

  new.created_by := current_user_id;
  select coalesce(
    nullif(user_data.raw_user_meta_data ->> 'full_name', ''),
    nullif(user_data.raw_user_meta_data ->> 'name', ''),
    split_part(user_data.email, '@', 1),
    'Usuário'
  ) into new.created_by_name
  from auth.users user_data
  where user_data.id = current_user_id;
  return new;
end;
$$;

revoke all on function public.set_transaction_author() from public, anon, authenticated;

create or replace function public.apply_ai_import_job(
  p_job_id uuid,
  p_actor_id uuid,
  p_actor_name text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  job public.ai_import_jobs%rowtype;
  item jsonb;
  account_map jsonb := '{}'::jsonb;
  category_map jsonb := '{}'::jsonb;
  new_id uuid;
  account_id_value uuid;
  category_id_value uuid;
  account_count integer := 0;
  category_count integer := 0;
  subscription_count integer := 0;
  transaction_count integer := 0;
begin
  if coalesce((select auth.jwt() ->> 'role'), '') <> 'service_role' then
    raise exception 'service_role_required';
  end if;

  select * into job from public.ai_import_jobs where id = p_job_id for update;
  if job.id is null then raise exception 'ai_import_not_found'; end if;
  if job.created_by <> p_actor_id then raise exception 'ai_import_actor_mismatch'; end if;
  if job.status <> 'ready' then raise exception 'ai_import_not_ready'; end if;
  if job.analysis is null then raise exception 'ai_import_analysis_missing'; end if;

  update public.ai_import_jobs set status = 'applying' where id = job.id;

  if coalesce((job.options ->> 'createAccounts')::boolean, false) then
    for item in select value from jsonb_array_elements(coalesce(job.analysis -> 'accounts', '[]'::jsonb)) loop
      insert into public.accounts (
        workspace_id, name, type, initial_balance, current_balance, currency, color, created_by_ai
      ) values (
        job.workspace_id,
        left(trim(item ->> 'name'), 120),
        coalesce(nullif(item ->> 'type', ''), 'checking'),
        greatest(coalesce((item ->> 'initialBalance')::numeric, 0), 0),
        greatest(coalesce((item ->> 'initialBalance')::numeric, 0), 0),
        coalesce(nullif(item ->> 'currency', ''), 'BRL'),
        nullif(item ->> 'color', ''),
        true
      ) returning id into new_id;
      account_map := account_map || jsonb_build_object(item ->> 'ref', new_id);
      account_count := account_count + 1;
    end loop;
  end if;

  if coalesce((job.options ->> 'createCategories')::boolean, false) then
    for item in select value from jsonb_array_elements(coalesce(job.analysis -> 'categories', '[]'::jsonb)) loop
      insert into public.categories (workspace_id, name, type, icon, color, created_by_ai)
      values (
        job.workspace_id,
        left(trim(item ->> 'name'), 120),
        item ->> 'type',
        coalesce(nullif(item ->> 'icon', ''), 'Tags'),
        coalesce(nullif(item ->> 'color', ''), '#8B5CF6'),
        true
      ) returning id into new_id;
      category_map := category_map || jsonb_build_object(item ->> 'ref', new_id);
      category_count := category_count + 1;
    end loop;
  end if;

  if coalesce((job.options ->> 'createSubscriptions')::boolean, false) then
    for item in select value from jsonb_array_elements(coalesce(job.analysis -> 'subscriptions', '[]'::jsonb)) loop
      category_id_value := coalesce(
        nullif(item ->> 'categoryId', '')::uuid,
        nullif(category_map ->> (item ->> 'categoryRef'), '')::uuid
      );
      insert into public.subscriptions (
        workspace_id, name, amount, frequency, category_id, next_billing_date, active, icon, created_by_ai
      ) values (
        job.workspace_id,
        left(trim(item ->> 'name'), 120),
        greatest((item ->> 'amount')::numeric, 0),
        coalesce(nullif(item ->> 'frequency', ''), 'monthly'),
        category_id_value,
        coalesce(nullif(item ->> 'nextBillingDate', '')::date, current_date),
        true,
        coalesce(nullif(item ->> 'icon', ''), 'Repeat2'),
        true
      );
      subscription_count := subscription_count + 1;
    end loop;
  end if;

  for item in select value from jsonb_array_elements(coalesce(job.analysis -> 'transactions', '[]'::jsonb)) loop
    account_id_value := coalesce(
      nullif(item ->> 'accountId', '')::uuid,
      nullif(account_map ->> (item ->> 'accountRef'), '')::uuid
    );
    category_id_value := coalesce(
      nullif(item ->> 'categoryId', '')::uuid,
      nullif(category_map ->> (item ->> 'categoryRef'), '')::uuid
    );
    insert into public.transactions (
      workspace_id, account_id, category_id, type, status, description, amount,
      date, notes, created_by, created_by_name, created_by_ai
    ) values (
      job.workspace_id,
      account_id_value,
      category_id_value,
      item ->> 'type',
      coalesce(nullif(item ->> 'status', ''), 'completed'),
      left(trim(item ->> 'description'), 300),
      greatest((item ->> 'amount')::numeric, 0),
      (item ->> 'date')::date,
      nullif(item ->> 'notes', ''),
      p_actor_id,
      left(coalesce(nullif(trim(p_actor_name), ''), 'Usuário'), 160),
      true
    );
    transaction_count := transaction_count + 1;
  end loop;

  update public.ai_import_jobs
  set status = 'completed', completed_at = now(), error_message = null
  where id = job.id;

  return jsonb_build_object(
    'accounts', account_count,
    'categories', category_count,
    'subscriptions', subscription_count,
    'transactions', transaction_count
  );
exception when others then
  raise;
end;
$$;

revoke all on function public.apply_ai_import_job(uuid, uuid, text) from public, anon, authenticated;
grant execute on function public.apply_ai_import_job(uuid, uuid, text) to service_role;
