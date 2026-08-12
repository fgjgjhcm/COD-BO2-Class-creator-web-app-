-- Public/private posts + current emblem on profiles
-- Run in Supabase SQL Editor after 003_emblems.sql.

-- Visibility columns ---------------------------------------------------------
alter table public.loadouts
  add column if not exists is_public boolean not null default true;

alter table public.emblems
  add column if not exists is_public boolean not null default true;

create index if not exists loadouts_is_public_idx
  on public.loadouts (is_public, created_at desc);
create index if not exists emblems_is_public_idx
  on public.emblems (is_public, created_at desc);

-- Current emblem on profile --------------------------------------------------
alter table public.profiles
  add column if not exists current_emblem_id uuid
    references public.emblems (id) on delete set null;

create index if not exists profiles_current_emblem_id_idx
  on public.profiles (current_emblem_id);

-- RLS: loadouts --------------------------------------------------------------
drop policy if exists "loadouts_select_all" on public.loadouts;
drop policy if exists "loadouts_select_public_or_own" on public.loadouts;
create policy "loadouts_select_public_or_own"
  on public.loadouts for select
  using (is_public = true or auth.uid() = user_id);

-- RLS: emblems ---------------------------------------------------------------
-- Public, own, OR selected as someone's current emblem (so private current still shows).
drop policy if exists "emblems_select_all" on public.emblems;
drop policy if exists "emblems_select_visible" on public.emblems;
create policy "emblems_select_visible"
  on public.emblems for select
  using (
    is_public = true
    or auth.uid() = user_id
    or exists (
      select 1
      from public.profiles p
      where p.current_emblem_id = emblems.id
    )
  );
