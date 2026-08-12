-- Community emblems (paste codes from BO2 emblem editor tools)
-- Run in Supabase SQL Editor after 002_follows_avatars.sql.

create table if not exists public.emblems (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  title text not null,
  description text,
  slug text not null unique,
  emblem_code text not null,
  preview_url text,
  remix_of uuid references public.emblems (id) on delete set null,
  like_count integer not null default 0,
  save_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint emblems_title_length check (char_length(title) between 1 and 64),
  constraint emblems_description_length check (
    description is null or char_length(description) <= 500
  ),
  constraint emblems_code_length check (
    char_length(emblem_code) between 8 and 60000
  )
);

create index if not exists emblems_created_at_idx
  on public.emblems (created_at desc);
create index if not exists emblems_like_count_idx
  on public.emblems (like_count desc);
create index if not exists emblems_user_id_idx
  on public.emblems (user_id);

drop trigger if exists emblems_set_updated_at on public.emblems;
create trigger emblems_set_updated_at
  before update on public.emblems
  for each row execute function public.set_updated_at();

alter table public.emblems enable row level security;

drop policy if exists "emblems_select_all" on public.emblems;
create policy "emblems_select_all"
  on public.emblems for select
  using (true);

drop policy if exists "emblems_insert_own" on public.emblems;
create policy "emblems_insert_own"
  on public.emblems for insert
  with check (auth.uid() = user_id);

drop policy if exists "emblems_update_own" on public.emblems;
create policy "emblems_update_own"
  on public.emblems for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "emblems_delete_own" on public.emblems;
create policy "emblems_delete_own"
  on public.emblems for delete
  using (auth.uid() = user_id);

-- Preview images -------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'emblem-previews',
  'emblem-previews',
  true,
  2097152,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "emblem_previews_select_public" on storage.objects;
create policy "emblem_previews_select_public"
  on storage.objects for select
  using (bucket_id = 'emblem-previews');

drop policy if exists "emblem_previews_insert_own" on storage.objects;
create policy "emblem_previews_insert_own"
  on storage.objects for insert
  with check (
    bucket_id = 'emblem-previews'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

drop policy if exists "emblem_previews_update_own" on storage.objects;
create policy "emblem_previews_update_own"
  on storage.objects for update
  using (
    bucket_id = 'emblem-previews'
    and auth.uid()::text = (storage.foldername(name))[1]
  )
  with check (
    bucket_id = 'emblem-previews'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

drop policy if exists "emblem_previews_delete_own" on storage.objects;
create policy "emblem_previews_delete_own"
  on storage.objects for delete
  using (
    bucket_id = 'emblem-previews'
    and auth.uid()::text = (storage.foldername(name))[1]
  );
