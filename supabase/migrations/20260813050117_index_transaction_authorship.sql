create index transactions_created_by_idx
  on public.transactions(created_by)
  where created_by is not null;
