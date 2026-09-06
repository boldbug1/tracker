create table public.focus_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  task_id integer references public.tasks(id) on delete set null,
  note_id integer references public.notes(id) on delete set null,
  mode text not null check (mode in ('pomodoro', 'deep_work', 'stopwatch')),
  started_at timestamp with time zone not null,
  ended_at timestamp with time zone,
  duration_seconds integer not null check (duration_seconds >= 0),
  completed boolean not null default false,
  created_at timestamp with time zone default now() not null
);

alter table public.focus_sessions enable row level security;

create policy "Users can view their own focus sessions"
  on public.focus_sessions for select
  using (auth.uid() = user_id);

create policy "Users can insert their own focus sessions"
  on public.focus_sessions for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own focus sessions"
  on public.focus_sessions for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete their own focus sessions"
  on public.focus_sessions for delete
  using (auth.uid() = user_id);
