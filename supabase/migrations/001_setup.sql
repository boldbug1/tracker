-- ============================================================
-- Dailys — Database Setup
-- Run this once in your Supabase SQL Editor
-- ============================================================

-- ── Profiles ────────────────────────────────────────────────
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  name        text not null default '',
  bio         text not null default '',
  avatar_url  text,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

alter table public.profiles enable row level security;

create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);

create policy "profiles_insert_own" on public.profiles
  for insert with check (auth.uid() = id);

create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id);

-- Auto-create profile row on sign-up
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, name)
  values (new.id, coalesce(new.raw_user_meta_data->>'name', ''));
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ── Tasks ────────────────────────────────────────────────────
create table if not exists public.tasks (
  id              bigint primary key,
  user_id         uuid references auth.users(id) on delete cascade not null,
  text            text not null,
  completed       boolean not null default false,
  priority        text not null default 'medium',
  category        text not null default 'work',
  time            text,
  linked_note_id  bigint,
  created_at      timestamptz default now()
);

alter table public.tasks enable row level security;

create policy "tasks_all_own" on public.tasks
  for all using (auth.uid() = user_id);

-- ── Notes ────────────────────────────────────────────────────
create table if not exists public.notes (
  id              bigint primary key,
  user_id         uuid references auth.users(id) on delete cascade not null,
  title           text not null,
  content         text not null default '',
  category        text not null default 'work',
  pinned          boolean not null default false,
  linked_task_id  bigint,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

alter table public.notes enable row level security;

create policy "notes_all_own" on public.notes
  for all using (auth.uid() = user_id);

-- ── Storage: avatars bucket ───────────────────────────────────
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

create policy "avatars_public_read" on storage.objects
  for select using (bucket_id = 'avatars');

create policy "avatars_upload_own" on storage.objects
  for insert with check (
    bucket_id = 'avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "avatars_update_own" on storage.objects
  for update using (
    bucket_id = 'avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "avatars_delete_own" on storage.objects
  for delete using (
    bucket_id = 'avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  );
