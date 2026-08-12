-- Spending Flows initial schema
-- Enables required extensions
create extension if not exists "uuid-ossp";

-- Workspaces group accounts, cards, transactions for a user or team
create table if not exists public.workspaces (
  id uuid primary key default uuid_generate_v4(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  type text not null check (type in ('personal', 'business', 'family')) default 'personal',
  currency text not null default 'BRL',
  created_at timestamptz not null default now()
);

-- Members of a workspace (owner is added automatically on creation)
create table if not exists public.workspace_members (
  id uuid primary key default uuid_generate_v4(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('owner', 'admin', 'member')) default 'member',
  created_at timestamptz not null default now(),
  unique (workspace_id, user_id)
);

create table if not exists public.accounts (
  id uuid primary key default uuid_generate_v4(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  name text not null,
  type text not null check (type in ('checking', 'savings', 'cash', 'investment', 'other')) default 'checking',
  initial_balance numeric(14, 2) not null default 0,
  current_balance numeric(14, 2) not null default 0,
  currency text not null default 'BRL',
  color text,
  archived boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.cards (
  id uuid primary key default uuid_generate_v4(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  account_id uuid references public.accounts(id) on delete set null,
  name text not null,
  brand text not null check (brand in ('visa', 'mastercard', 'amex', 'elo', 'other')) default 'other',
  limit_amount numeric(14, 2) not null default 0,
  closing_day smallint not null default 1 check (closing_day between 1 and 31),
  due_day smallint not null default 10 check (due_day between 1 and 31),
  color text,
  archived boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.categories (
  id uuid primary key default uuid_generate_v4(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  name text not null,
  type text not null check (type in ('income', 'expense')) default 'expense',
  icon text,
  color text,
  parent_id uuid references public.categories(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.transactions (
  id uuid primary key default uuid_generate_v4(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  account_id uuid references public.accounts(id) on delete set null,
  card_id uuid references public.cards(id) on delete set null,
  category_id uuid references public.categories(id) on delete set null,
  transfer_account_id uuid references public.accounts(id) on delete set null,
  type text not null check (type in ('income', 'expense', 'transfer')),
  status text not null check (status in ('pending', 'completed', 'scheduled')) default 'completed',
  description text not null,
  amount numeric(14, 2) not null check (amount >= 0),
  date date not null default current_date,
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists public.recurrences (
  id uuid primary key default uuid_generate_v4(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  description text not null,
  amount numeric(14, 2) not null check (amount >= 0),
  type text not null check (type in ('income', 'expense', 'transfer')),
  category_id uuid references public.categories(id) on delete set null,
  account_id uuid references public.accounts(id) on delete set null,
  frequency text not null check (frequency in ('daily', 'weekly', 'monthly', 'yearly')) default 'monthly',
  start_date date not null default current_date,
  end_date date,
  next_occurrence date not null default current_date,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.subscriptions (
  id uuid primary key default uuid_generate_v4(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  name text not null,
  amount numeric(14, 2) not null check (amount >= 0),
  frequency text not null check (frequency in ('daily', 'weekly', 'monthly', 'yearly')) default 'monthly',
  category_id uuid references public.categories(id) on delete set null,
  card_id uuid references public.cards(id) on delete set null,
  next_billing_date date not null default current_date,
  active boolean not null default true,
  icon text,
  created_at timestamptz not null default now()
);

create table if not exists public.channels (
  id uuid primary key default uuid_generate_v4(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  type text not null check (type in ('email', 'whatsapp', 'telegram', 'sms')),
  identifier text not null,
  verified boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.notifications (
  id uuid primary key default uuid_generate_v4(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  message text not null,
  read boolean not null default false,
  created_at timestamptz not null default now()
);

-- Helpful indexes
create index if not exists idx_workspace_members_user on public.workspace_members(user_id);
create index if not exists idx_accounts_workspace on public.accounts(workspace_id);
create index if not exists idx_cards_workspace on public.cards(workspace_id);
create index if not exists idx_categories_workspace on public.categories(workspace_id);
create index if not exists idx_transactions_workspace on public.transactions(workspace_id);
create index if not exists idx_transactions_date on public.transactions(date);
create index if not exists idx_recurrences_workspace on public.recurrences(workspace_id);
create index if not exists idx_subscriptions_workspace on public.subscriptions(workspace_id);
create index if not exists idx_channels_workspace on public.channels(workspace_id);
create index if not exists idx_notifications_user on public.notifications(user_id);
