-- Seed default categories automatically whenever a new workspace is created.
create or replace function public.seed_default_categories()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.categories (workspace_id, name, type, color) values

    -- DESPESAS FIXAS / CASA
    (new.id, 'Moradia', 'expense', '#7C3AED'),
    (new.id, 'Casa & Utilidades', 'expense', '#8B5CF6'),

    -- ALIMENTAÇÃO
    (new.id, 'Supermercado', 'expense', '#A78BFA'),
    (new.id, 'Restaurantes & Delivery', 'expense', '#C4B5FD'),

    -- MOBILIDADE
    (new.id, 'Transporte', 'expense', '#6D5BD0'),

    -- SAÚDE E QUALIDADE DE VIDA
    (new.id, 'Saúde & Farmácia', 'expense', '#9F7AEA'),
    (new.id, 'Academia & Bem-estar', 'expense', '#B794F4'),

    -- DESENVOLVIMENTO PESSOAL / PROFISSIONAL
    (new.id, 'Educação & Certificações', 'expense', '#5B3FA3'),
    (new.id, 'Trabalho & Carreira', 'expense', '#4C3575'),
    (new.id, 'Tecnologia & Equipamentos', 'expense', '#3D2C76'),
    (new.id, 'Assinaturas & Software', 'expense', '#7251B5'),

    -- VIDA PESSOAL
    (new.id, 'Lazer & Social', 'expense', '#D6C3FA'),
    (new.id, 'Compras Pessoais', 'expense', '#A994C9'),
    (new.id, 'Viagens', 'expense', '#C8A2E8'),
    (new.id, 'Presentes & Doações', 'expense', '#DAC9F5'),

    -- FINANCEIRO
    (new.id, 'Seguros', 'expense', '#65508F'),
    (new.id, 'Impostos & Taxas', 'expense', '#55406E'),
    (new.id, 'Imprevistos', 'expense', '#8064A2'),
    (new.id, 'Outras Despesas', 'expense', '#B8A7CC'),

    -- RECEITAS
    (new.id, 'Salário', 'income', '#22C55E'),
    (new.id, 'Plantões', 'income', '#16A34A'),
    (new.id, 'Freelance & Consultoria', 'income', '#4ADE80'),
    (new.id, 'Bônus & Benefícios', 'income', '#86EFAC'),
    (new.id, 'Reembolsos', 'income', '#10B981'),
    (new.id, 'Investimentos & Rendimentos', 'income', '#059669'),
    (new.id, 'Outras Receitas', 'income', '#6EE7B7');

  return new;
end;
$$;

revoke all on function public.seed_default_categories() from public, anon, authenticated;

drop trigger if exists trg_seed_default_categories on public.workspaces;
create trigger trg_seed_default_categories
  after insert on public.workspaces
  for each row execute function public.seed_default_categories();
