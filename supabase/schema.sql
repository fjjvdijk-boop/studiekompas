-- StudieKompas – database voor Supabase
-- Plak dit in Supabase → SQL Editor → New query, en klik op Run.
-- Je kunt het veilig opnieuw draaien: bestaande tabellen worden bijgewerkt.

-- Profiel per gebruiker (1 rij per account). Het hele profiel (vragenlijst, woonplaats, budget …) staat in "data".
create table if not exists public.profielen (
  id          uuid primary key references auth.users (id) on delete cascade,
  email       text,
  naam        text not null default '',
  data        jsonb,
  bijgewerkt  timestamptz not null default now()
);
alter table public.profielen add column if not exists data jsonb;

-- Favorieten, met datum van de open dag, cijfer en notitie
create table if not exists public.favorieten (
  user_id       uuid not null default auth.uid() references auth.users (id) on delete cascade,
  opleiding_id  text not null,
  toegevoegd    date not null default current_date,
  open_dag      date,
  bezocht       boolean not null default false,
  cijfer        integer check (cijfer between 1 and 10),
  notitie       text not null default '',
  primary key (user_id, opleiding_id)
);
alter table public.favorieten add column if not exists open_dag date;

create index if not exists favorieten_open_dag_idx on public.favorieten (open_dag);

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
