-- ============================================================================
-- B-WORK — Schema do Supabase
-- Execute TODO este script no SQL Editor do seu painel Supabase:
--   https://supabase.com/dashboard/project/roohtpdctpxdizfelbik/sql/new
-- Pode rodar quantas vezes quiser (usa IF NOT EXISTS / ON CONFLICT).
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1) Função auxiliar: is_admin() — verifica se o usuário atual é admin
-- ----------------------------------------------------------------------------
create or replace function public.is_admin()
returns boolean
language sql
security definer set search_path = public
stable
as $$
  select coalesce(
    (select role = 'admin' from public.profiles where id = auth.uid()),
    false
  );
$$;

-- ----------------------------------------------------------------------------
-- 2) Tabela de perfis (espelho de auth.users com full_name e role)
-- ----------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text default '',
  full_name text default '',
  role text not null default 'user',
  created_date timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "profiles_read" on public.profiles;
create policy "profiles_read" on public.profiles
  for select to authenticated using (true);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
  for update to authenticated
  using (auth.uid() = id or public.is_admin())
  with check (auth.uid() = id or public.is_admin());

-- Trigger: criar perfil automaticamente quando um usuário se cadastra
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    'user'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ----------------------------------------------------------------------------
-- 3) Tabela obras
-- ----------------------------------------------------------------------------
create table if not exists public.obras (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  descricao text default '',
  cliente text default '',
  endereco text default '',
  status text not null default 'planejamento',
  data_inicio date,
  previsao_conclusao date,
  created_by_id uuid default auth.uid(),
  created_date timestamptz not null default now(),
  updated_date timestamptz not null default now()
);

alter table public.obras enable row level security;

drop policy if exists "obras_read" on public.obras;
create policy "obras_read" on public.obras for select to authenticated
  using (created_by_id = auth.uid() or public.is_admin());

drop policy if exists "obras_insert" on public.obras;
create policy "obras_insert" on public.obras for insert to authenticated
  with check (created_by_id = auth.uid() or public.is_admin());

drop policy if exists "obras_update" on public.obras;
create policy "obras_update" on public.obras for update to authenticated
  using (created_by_id = auth.uid() or public.is_admin())
  with check (created_by_id = auth.uid() or public.is_admin());

drop policy if exists "obras_delete" on public.obras;
create policy "obras_delete" on public.obras for delete to authenticated
  using (created_by_id = auth.uid() or public.is_admin());

-- ----------------------------------------------------------------------------
-- 4) Tabela ambientes
-- ----------------------------------------------------------------------------
create table if not exists public.ambientes (
  id uuid primary key default gen_random_uuid(),
  obra_id uuid references public.obras(id) on delete cascade,
  nome text not null,
  descricao text default '',
  created_by_id uuid default auth.uid(),
  created_date timestamptz not null default now(),
  updated_date timestamptz not null default now()
);

alter table public.ambientes enable row level security;

drop policy if exists "ambientes_read" on public.ambientes;
create policy "ambientes_read" on public.ambientes for select to authenticated using (true);

drop policy if exists "ambientes_insert" on public.ambientes;
create policy "ambientes_insert" on public.ambientes for insert to authenticated
  with check (true);

drop policy if exists "ambientes_update" on public.ambientes;
create policy "ambientes_update" on public.ambientes for update to authenticated
  using (created_by_id = auth.uid() or public.is_admin())
  with check (created_by_id = auth.uid() or public.is_admin());

drop policy if exists "ambientes_delete" on public.ambientes;
create policy "ambientes_delete" on public.ambientes for delete to authenticated
  using (created_by_id = auth.uid() or public.is_admin());

-- ----------------------------------------------------------------------------
-- 5) Tabela tarefas (serviços)
-- ----------------------------------------------------------------------------
create table if not exists public.tarefas (
  id uuid primary key default gen_random_uuid(),
  obra_id uuid references public.obras(id) on delete cascade,
  ambiente_id uuid references public.ambientes(id) on delete set null,
  titulo text not null,
  descricao text default '',
  status text not null default 'pendente',
  prioridade text not null default 'media',
  responsavel_id uuid,
  completed_at timestamptz,
  created_by_id uuid default auth.uid(),
  created_date timestamptz not null default now(),
  updated_date timestamptz not null default now()
);

alter table public.tarefas enable row level security;

drop policy if exists "tarefas_read" on public.tarefas;
create policy "tarefas_read" on public.tarefas for select to authenticated using (true);

drop policy if exists "tarefas_insert" on public.tarefas;
create policy "tarefas_insert" on public.tarefas for insert to authenticated with check (true);

drop policy if exists "tarefas_update" on public.tarefas;
create policy "tarefas_update" on public.tarefas for update to authenticated
  using (true) with check (true);

drop policy if exists "tarefas_delete" on public.tarefas;
create policy "tarefas_delete" on public.tarefas for delete to authenticated
  using (created_by_id = auth.uid() or public.is_admin());

-- ----------------------------------------------------------------------------
-- 6) Tabela fotos
-- ----------------------------------------------------------------------------
create table if not exists public.fotos (
  id uuid primary key default gen_random_uuid(),
  obra_id uuid references public.obras(id) on delete cascade,
  ambiente_id uuid references public.ambientes(id) on delete set null,
  file_url text not null,
  legenda text default '',
  created_by_id uuid default auth.uid(),
  created_date timestamptz not null default now(),
  updated_date timestamptz not null default now()
);

alter table public.fotos enable row level security;

drop policy if exists "fotos_read" on public.fotos;
create policy "fotos_read" on public.fotos for select to authenticated using (true);

drop policy if exists "fotos_insert" on public.fotos;
create policy "fotos_insert" on public.fotos for insert to authenticated with check (true);

drop policy if exists "fotos_update" on public.fotos;
create policy "fotos_update" on public.fotos for update to authenticated
  using (created_by_id = auth.uid() or public.is_admin())
  with check (created_by_id = auth.uid() or public.is_admin());

drop policy if exists "fotos_delete" on public.fotos;
create policy "fotos_delete" on public.fotos for delete to authenticated
  using (created_by_id = auth.uid() or public.is_admin());

-- ----------------------------------------------------------------------------
-- 7) Tabela registros
-- ----------------------------------------------------------------------------
create table if not exists public.registros (
  id uuid primary key default gen_random_uuid(),
  obra_id uuid references public.obras(id) on delete cascade,
  ambiente_id uuid references public.ambientes(id) on delete set null,
  tipo text not null default 'observacao',
  titulo text not null,
  descricao text default '',
  created_by_id uuid default auth.uid(),
  created_date timestamptz not null default now(),
  updated_date timestamptz not null default now()
);

alter table public.registros enable row level security;

drop policy if exists "registros_read" on public.registros;
create policy "registros_read" on public.registros for select to authenticated using (true);

drop policy if exists "registros_insert" on public.registros;
create policy "registros_insert" on public.registros for insert to authenticated with check (true);

drop policy if exists "registros_update" on public.registros;
create policy "registros_update" on public.registros for update to authenticated
  using (created_by_id = auth.uid() or public.is_admin())
  with check (created_by_id = auth.uid() or public.is_admin());

drop policy if exists "registros_delete" on public.registros;
create policy "registros_delete" on public.registros for delete to authenticated
  using (created_by_id = auth.uid() or public.is_admin());

-- ----------------------------------------------------------------------------
-- 8) Tabela membros_obra (equipe por obra)
-- ----------------------------------------------------------------------------
create table if not exists public.membros_obra (
  id uuid primary key default gen_random_uuid(),
  obra_id uuid references public.obras(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  created_by_id uuid default auth.uid(),
  created_date timestamptz not null default now(),
  unique (obra_id, user_id)
);

alter table public.membros_obra enable row level security;

drop policy if exists "membros_read" on public.membros_obra;
create policy "membros_read" on public.membros_obra for select to authenticated using (true);

drop policy if exists "membros_insert" on public.membros_obra;
create policy "membros_insert" on public.membros_obra for insert to authenticated with check (true);

drop policy if exists "membros_update" on public.membros_obra;
create policy "membros_update" on public.membros_obra for update to authenticated
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists "membros_delete" on public.membros_obra;
create policy "membros_delete" on public.membros_obra for delete to authenticated
  using (public.is_admin());

-- ----------------------------------------------------------------------------
-- 9) Tabela historico (auditoria)
-- ----------------------------------------------------------------------------
create table if not exists public.historico (
  id uuid primary key default gen_random_uuid(),
  obra_id uuid,
  acao text not null,
  entidade text default '',
  entidade_id text default '',
  descricao text default '',
  created_by_id uuid default auth.uid(),
  created_date timestamptz not null default now()
);

alter table public.historico enable row level security;

drop policy if exists "historico_read" on public.historico;
create policy "historico_read" on public.historico for select to authenticated using (true);

drop policy if exists "historico_insert" on public.historico;
create policy "historico_insert" on public.historico for insert to authenticated with check (true);

-- Sem update policy = historico é imutável.
drop policy if exists "historico_delete" on public.historico;
create policy "historico_delete" on public.historico for delete to authenticated
  using (public.is_admin());

-- ----------------------------------------------------------------------------
-- 10) Trigger genérico para updated_date
-- ----------------------------------------------------------------------------
create or replace function public.set_updated_date()
returns trigger
language plpgsql
as $$
begin
  new.updated_date = now();
  return new;
end;
$$;

drop trigger if exists set_updated_date on public.obras;
create trigger set_updated_date before update on public.obras
  for each row execute function public.set_updated_date();

drop trigger if exists set_updated_date on public.ambientes;
create trigger set_updated_date before update on public.ambientes
  for each row execute function public.set_updated_date();

drop trigger if exists set_updated_date on public.tarefas;
create trigger set_updated_date before update on public.tarefas
  for each row execute function public.set_updated_date();

drop trigger if exists set_updated_date on public.fotos;
create trigger set_updated_date before update on public.fotos
  for each row execute function public.set_updated_date();

drop trigger if exists set_updated_date on public.registros;
create trigger set_updated_date before update on public.registros
  for each row execute function public.set_updated_date();

-- ----------------------------------------------------------------------------
-- 11) Bucket público de fotos (Storage)
-- ----------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('fotos', 'fotos', true)
on conflict (id) do nothing;

drop policy if exists "fotos_bucket_read" on storage.objects;
create policy "fotos_bucket_read" on storage.objects for select
  using (bucket_id = 'fotos');

drop policy if exists "fotos_bucket_upload" on storage.objects;
create policy "fotos_bucket_upload" on storage.objects for insert to authenticated
  with check (bucket_id = 'fotos');

drop policy if exists "fotos_bucket_delete" on storage.objects;
create policy "fotos_bucket_delete" on storage.objects for delete to authenticated
  using (bucket_id = 'fotos');

-- ============================================================================
-- FIM. Pronto! O app já pode conectar.
-- ============================================================================