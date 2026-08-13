create or replace function private.complete_onboarding_impl(
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
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := (select auth.uid());
  new_workspace_id uuid;
begin
  if current_user_id is null then raise exception 'authentication_required'; end if;
  if trim(workspace_name) = '' then raise exception 'workspace_name_required'; end if;
  if workspace_type not in ('personal', 'business', 'family') then raise exception 'invalid_workspace_type'; end if;
  if workspace_accent_color !~ '^#[0-9A-Fa-f]{6}$' then raise exception 'invalid_accent_color'; end if;

  insert into public.workspaces (owner_id, name, type, currency, accent_color)
  values (current_user_id, trim(workspace_name), workspace_type, workspace_currency, upper(workspace_accent_color))
  returning id into new_workspace_id;

  insert into public.workspace_members (workspace_id, user_id, role)
  values (new_workspace_id, current_user_id, 'owner')
  on conflict (workspace_id, user_id) do update set role = 'owner';

  insert into public.accounts (workspace_id, name, type, initial_balance, current_balance, currency)
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
    from unnest(expense_categories) category_name where trim(category_name) <> '';
    insert into public.categories (workspace_id, name, type, color, icon)
    select new_workspace_id, trim(category_name), 'income', '#22C55E', 'WalletCards'
    from unnest(income_categories) category_name where trim(category_name) <> '';
  end if;

  return new_workspace_id;
end;
$$;

revoke all on function private.complete_onboarding_impl(text, text, text, text, text, text, numeric, text[], text[]) from public, anon;
grant usage on schema private to authenticated;
grant execute on function private.complete_onboarding_impl(text, text, text, text, text, text, numeric, text[], text[]) to authenticated;

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
language sql
security invoker
set search_path = ''
as $$
  select private.complete_onboarding_impl(
    workspace_name,
    workspace_type,
    workspace_currency,
    workspace_accent_color,
    account_name,
    account_type,
    initial_balance,
    expense_categories,
    income_categories
  );
$$;

revoke all on function public.complete_onboarding(text, text, text, text, text, text, numeric, text[], text[]) from public, anon;
grant execute on function public.complete_onboarding(text, text, text, text, text, text, numeric, text[], text[]) to authenticated;
