alter table public.transactions
  add column created_by uuid references auth.users(id) on delete set null,
  add column created_by_name text;

comment on column public.transactions.created_by is 'Conta autenticada que criou o lançamento.';
comment on column public.transactions.created_by_name is 'Nome de apresentação preservado no momento do lançamento.';

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
    raise exception 'authentication_required';
  end if;

  new.created_by := current_user_id;
  select coalesce(
    nullif(user_data.raw_user_meta_data ->> 'full_name', ''),
    nullif(user_data.raw_user_meta_data ->> 'name', ''),
    split_part(user_data.email, '@', 1),
    'Usuário'
  )
  into new.created_by_name
  from auth.users user_data
  where user_data.id = current_user_id;

  return new;
end;
$$;

revoke all on function public.set_transaction_author() from public, anon, authenticated;

drop trigger if exists trg_set_transaction_author on public.transactions;
create trigger trg_set_transaction_author
  before insert on public.transactions
  for each row execute function public.set_transaction_author();

update public.transactions transaction_row
set
  created_by = workspace_row.owner_id,
  created_by_name = coalesce(
    nullif(user_data.raw_user_meta_data ->> 'full_name', ''),
    nullif(user_data.raw_user_meta_data ->> 'name', ''),
    split_part(user_data.email, '@', 1),
    'Usuário'
  )
from public.workspaces workspace_row
left join auth.users user_data on user_data.id = workspace_row.owner_id
where workspace_row.id = transaction_row.workspace_id
  and transaction_row.created_by is null;

create or replace function public.complete_onboarding(
  workspace_name text,
  workspace_type text,
  workspace_currency text,
  workspace_accent_color text,
  account_name text,
  account_type text,
  initial_balance numeric,
  expense_categories text[],
  income_categories text[]
)
returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  current_user_id uuid := (select auth.uid());
  new_workspace_id uuid;
begin
  if current_user_id is null then
    raise exception 'authentication_required';
  end if;
  if trim(workspace_name) = '' then
    raise exception 'workspace_name_required';
  end if;
  if workspace_type not in ('personal', 'business', 'family') then
    raise exception 'invalid_workspace_type';
  end if;
  if workspace_accent_color !~ '^#[0-9A-Fa-f]{6}$' then
    raise exception 'invalid_accent_color';
  end if;

  insert into public.workspaces (owner_id, name, type, currency, accent_color)
  values (
    current_user_id,
    trim(workspace_name),
    workspace_type,
    workspace_currency,
    upper(workspace_accent_color)
  )
  returning id into new_workspace_id;

  insert into public.workspace_members (workspace_id, user_id, role)
  values (new_workspace_id, current_user_id, 'owner')
  on conflict (workspace_id, user_id) do update set role = 'owner';

  insert into public.accounts (
    workspace_id, name, type, initial_balance, current_balance, currency
  )
  values (
    new_workspace_id,
    coalesce(nullif(trim(account_name), ''), 'Conta Principal'),
    account_type,
    greatest(coalesce(initial_balance, 0), 0),
    greatest(coalesce(initial_balance, 0), 0),
    workspace_currency
  );

  if coalesce(array_length(expense_categories, 1), 0) + coalesce(array_length(income_categories, 1), 0) > 0 then
    delete from public.categories where workspace_id = new_workspace_id;

    insert into public.categories (workspace_id, name, type, color, icon)
    select new_workspace_id, trim(category_name), 'expense', '#8B5CF6', 'ShoppingBag'
    from unnest(expense_categories) category_name
    where trim(category_name) <> '';

    insert into public.categories (workspace_id, name, type, color, icon)
    select new_workspace_id, trim(category_name), 'income', '#22C55E', 'WalletCards'
    from unnest(income_categories) category_name
    where trim(category_name) <> '';
  end if;

  return new_workspace_id;
end;
$$;

revoke all on function public.complete_onboarding(text, text, text, text, text, text, numeric, text[], text[]) from public, anon;
grant execute on function public.complete_onboarding(text, text, text, text, text, text, numeric, text[], text[]) to authenticated;
