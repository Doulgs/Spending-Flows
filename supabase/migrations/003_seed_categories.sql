-- Seed default categories automatically whenever a new workspace is created.
create or replace function public.seed_default_categories()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.categories (workspace_id, name, type, color) values
    (new.id, 'Moradia', 'expense', '#A179FA'),
    (new.id, 'Alimentação', 'expense', '#8D67F2'),
    (new.id, 'Transporte', 'expense', '#AE87FB'),
    (new.id, 'Saúde', 'expense', '#D6C3FA'),
    (new.id, 'Educação', 'expense', '#3D2C76'),
    (new.id, 'Lazer', 'expense', '#EADEFC'),
    (new.id, 'Compras', 'expense', '#2E215D'),
    (new.id, 'Assinaturas', 'expense', '#A994C9'),
    (new.id, 'Salário', 'income', '#A179FA'),
    (new.id, 'Freelance', 'income', '#8D67F2'),
    (new.id, 'Investimentos', 'income', '#AE87FB'),
    (new.id, 'Outros', 'income', '#D6C3FA');
  return new;
end;
$$;

drop trigger if exists trg_seed_default_categories on public.workspaces;
create trigger trg_seed_default_categories
  after insert on public.workspaces
  for each row execute function public.seed_default_categories();
