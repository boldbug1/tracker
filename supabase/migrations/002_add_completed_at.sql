-- 002 — Add completed_at for accurate completion analytics
-- Run this in Supabase SQL Editor (after 001_setup.sql)

alter table public.tasks add column if not exists completed_at timestamptz;

-- Backfill: completed tasks get now() as approximation
update public.tasks set completed_at = created_at where completed = true and completed_at is null;

-- Index for analytics queries (last 30 days by completed_at)
create index if not exists tasks_user_completed_at_idx on public.tasks (user_id, completed_at);
create index if not exists tasks_user_created_at_idx on public.tasks (user_id, created_at);
