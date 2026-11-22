-- StudieKompas – database voor Supabase
-- Plak dit in Supabase → SQL Editor → New query, en klik op Run.

-- Profiel per gebruiker (1 rij per account)
create table if not exists public.profielen (
  id            uuid primary key references auth.users (id) on delete cascade,
  email         text,
  naam          text not null default '',
  interesses    text[] not null default '{}',
  niveau        text not null default 'beide' check (niveau in ('beide', 'hbo', 'wo')),
  budget        integer not null default 800 check (budget between 0 and 5000),
  max_reistijd  integer not null default 45 check (max_reistijd between 0 and 300),
  bijgewerkt    timestamptz not null default now()
);

-- Favorieten, met cijfer en notitie na de open dag
create table if not exists public.favorieten (
  user_id       uuid not null default auth.uid() references auth.users (id) on delete cascade,
  opleiding_id  text not null,
  toegevoegd    date not null default current_date,
  bezocht       boolean not null default false,
  cijfer        integer check (cijfer between 1 and 10),
  notitie       text not null default '',
  primary key (user_id, opleiding_id)
);

create index if not exists favorieten_opleiding_idx on public.favorieten (opleiding_id);

-- Beveiliging: iedereen ziet en wijzigt ALLEEN zijn eigen rijen (row level security)
alter table public.profielen enable row level security;
alter table public.favorieten enable row level security;

drop policy if exists "eigen profiel" on public.profielen;
create policy "eigen profiel" on public.profielen
  for all to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

drop policy if exists "eigen favorieten" on public.favorieten;
create policy "eigen favorieten" on public.favorieten
  for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
