-- Community Hub schema for bo2loadouts.com
-- Run in Supabase SQL Editor (Dashboard → SQL → New query).
--
-- Future emblems table (not created yet) should mirror loadouts:
--   emblems (id, user_id, title, description, slug, emblem_data jsonb,
--            like_count, save_count, remix_of, created_at, updated_at)
-- emblem_data JSONB shape (planned):
--   { layers: [{ id, shape, x, y, scale, rotation, color, opacity, order }] }

create extension if not exists citext;

-- Profiles -------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  username citext unique,
  display_name text,
  avatar_url text,
  bio text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint username_format check (
    username is null
    or username ~ '^[a-z0-9_]{3,20}$'
  )
);

create index if not exists profiles_username_idx on public.profiles (username);

-- Loadouts -------------------------------------------------------------------
create table if not exists public.loadouts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  title text not null,
  description text,
  slug text not null unique,
  loadout_data jsonb not null,
  remix_of uuid references public.loadouts (id) on delete set null,
  like_count integer not null default 0,
  save_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint title_length check (char_length(title) between 1 and 64),
  constraint description_length check (
    description is null or char_length(description) <= 500
  )
);

create index if not exists loadouts_created_at_idx
  on public.loadouts (created_at desc);
create index if not exists loadouts_like_count_idx
  on public.loadouts (like_count desc);
create index if not exists loadouts_user_id_idx
  on public.loadouts (user_id);
create index if not exists loadouts_title_ilike_idx
  on public.loadouts (lower(title));
create index if not exists loadouts_primary_weapon_idx
  on public.loadouts ((loadout_data->>'primaryWeaponId'));

-- Likes / Saves --------------------------------------------------------------
create table if not exists public.loadout_likes (
  user_id uuid not null references public.profiles (id) on delete cascade,
  loadout_id uuid not null references public.loadouts (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, loadout_id)
);

create table if not exists public.loadout_saves (
  user_id uuid not null references public.profiles (id) on delete cascade,
  loadout_id uuid not null references public.loadouts (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, loadout_id)
);

-- Reports (moderation foundation) --------------------------------------------
create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references public.profiles (id) on delete cascade,
  loadout_id uuid not null references public.loadouts (id) on delete cascade,
  reason text,
  created_at timestamptz not null default now()
);

create index if not exists reports_loadout_id_idx on public.reports (loadout_id);

-- Updated_at helper ----------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

drop trigger if exists loadouts_set_updated_at on public.loadouts;
create trigger loadouts_set_updated_at
  before update on public.loadouts
  for each row execute function public.set_updated_at();

-- Auto-create profile on signup ----------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, avatar_url, display_name)
  values (
    new.id,
    coalesce(
      new.raw_user_meta_data->>'avatar_url',
      new.raw_user_meta_data->>'picture'
    ),
    coalesce(
      new.raw_user_meta_data->>'full_name',
      new.raw_user_meta_data->>'name',
      new.raw_user_meta_data->>'preferred_username'
    )
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Like / save counters -------------------------------------------------------
create or replace function public.bump_like_count()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    update public.loadouts
      set like_count = like_count + 1
      where id = new.loadout_id;
    return new;
  elsif tg_op = 'DELETE' then
    update public.loadouts
      set like_count = greatest(like_count - 1, 0)
      where id = old.loadout_id;
    return old;
  end if;
  return null;
end;
$$;

create or replace function public.bump_save_count()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    update public.loadouts
      set save_count = save_count + 1
      where id = new.loadout_id;
    return new;
  elsif tg_op = 'DELETE' then
    update public.loadouts
      set save_count = greatest(save_count - 1, 0)
      where id = old.loadout_id;
    return old;
  end if;
  return null;
end;
$$;

drop trigger if exists loadout_likes_count on public.loadout_likes;
create trigger loadout_likes_count
  after insert or delete on public.loadout_likes
  for each row execute function public.bump_like_count();

drop trigger if exists loadout_saves_count on public.loadout_saves;
create trigger loadout_saves_count
  after insert or delete on public.loadout_saves
  for each row execute function public.bump_save_count();

-- Trending helper view (optional; app can also compute client-side) ----------
-- score = like_count / ((hours_since_created + 2) ^ 1.5)
create or replace view public.loadouts_trending as
select
  l.*,
  (l.like_count::float)
    / power(extract(epoch from (now() - l.created_at)) / 3600.0 + 2.0, 1.5)
    as trending_score
from public.loadouts l;

-- RLS ------------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.loadouts enable row level security;
alter table public.loadout_likes enable row level security;
alter table public.loadout_saves enable row level security;
alter table public.reports enable row level security;

-- Profiles: public read; users update own
drop policy if exists "profiles_select_all" on public.profiles;
create policy "profiles_select_all"
  on public.profiles for select
  using (true);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own"
  on public.profiles for insert
  with check (auth.uid() = id);

-- Loadouts: public read; owners write
drop policy if exists "loadouts_select_all" on public.loadouts;
create policy "loadouts_select_all"
  on public.loadouts for select
  using (true);

drop policy if exists "loadouts_insert_own" on public.loadouts;
create policy "loadouts_insert_own"
  on public.loadouts for insert
  with check (auth.uid() = user_id);

drop policy if exists "loadouts_update_own" on public.loadouts;
create policy "loadouts_update_own"
  on public.loadouts for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "loadouts_delete_own" on public.loadouts;
create policy "loadouts_delete_own"
  on public.loadouts for delete
  using (auth.uid() = user_id);

-- Likes
drop policy if exists "likes_select_all" on public.loadout_likes;
create policy "likes_select_all"
  on public.loadout_likes for select
  using (true);

drop policy if exists "likes_insert_own" on public.loadout_likes;
create policy "likes_insert_own"
  on public.loadout_likes for insert
  with check (auth.uid() = user_id);

drop policy if exists "likes_delete_own" on public.loadout_likes;
create policy "likes_delete_own"
  on public.loadout_likes for delete
  using (auth.uid() = user_id);

-- Saves: owner can read own saves; public cannot list others' saves via policy
-- (app queries saves filtered by auth.uid())
drop policy if exists "saves_select_own" on public.loadout_saves;
create policy "saves_select_own"
  on public.loadout_saves for select
  using (auth.uid() = user_id);

drop policy if exists "saves_insert_own" on public.loadout_saves;
create policy "saves_insert_own"
  on public.loadout_saves for insert
  with check (auth.uid() = user_id);

drop policy if exists "saves_delete_own" on public.loadout_saves;
create policy "saves_delete_own"
  on public.loadout_saves for delete
  using (auth.uid() = user_id);

-- Reports: authenticated insert own; no public read
drop policy if exists "reports_insert_own" on public.reports;
create policy "reports_insert_own"
  on public.reports for insert
  with check (auth.uid() = reporter_id);
