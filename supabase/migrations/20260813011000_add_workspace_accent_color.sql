alter table public.workspaces
  add column if not exists accent_color text not null default '#8B5CF6';

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'workspaces_accent_color_hex_check'
      and conrelid = 'public.workspaces'::regclass
  ) then
    alter table public.workspaces
      add constraint workspaces_accent_color_hex_check
      check (accent_color ~ '^#[0-9A-Fa-f]{6}$');
  end if;
end $$;
