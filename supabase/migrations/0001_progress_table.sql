-- Cloud-sync schema for emo-training (PR #13).
--
-- Run once in Supabase SQL Editor on a fresh project. Idempotent — safe
-- to re-run; existing tables and policies are not dropped.
--
-- Architecture: a single `progress` row per user holding the entire
-- localStorage Progress JSON. Last-write-wins by `updated_at`. Row
-- Level Security ensures users can only read/write their own row.

create table if not exists public.progress (
  user_id uuid primary key references auth.users(id) on delete cascade,
  data jsonb not null,
  updated_at timestamptz not null default now()
);

-- Auto-bump updated_at on every upsert.
create or replace function public.tg_progress_set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists progress_set_updated_at on public.progress;
create trigger progress_set_updated_at
  before update on public.progress
  for each row execute function public.tg_progress_set_updated_at();

-- Row Level Security — users can only see / write their own row.
alter table public.progress enable row level security;

drop policy if exists "progress_select_own" on public.progress;
create policy "progress_select_own"
  on public.progress for select
  using (auth.uid() = user_id);

drop policy if exists "progress_insert_own" on public.progress;
create policy "progress_insert_own"
  on public.progress for insert
  with check (auth.uid() = user_id);

drop policy if exists "progress_update_own" on public.progress;
create policy "progress_update_own"
  on public.progress for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "progress_delete_own" on public.progress;
create policy "progress_delete_own"
  on public.progress for delete
  using (auth.uid() = user_id);
