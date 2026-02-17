-- =====================================================
-- Smart Bookmark App — Supabase Database Setup
-- Run this in your Supabase SQL Editor
-- =====================================================

-- Create bookmarks table
create table if not exists public.bookmarks (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  url         text not null,
  title       text not null,
  created_at  timestamptz not null default now()
);

-- Index for fast per-user queries
create index if not exists bookmarks_user_id_idx on public.bookmarks(user_id);
create index if not exists bookmarks_created_at_idx on public.bookmarks(created_at desc);

-- Enable Row Level Security
alter table public.bookmarks enable row level security;

-- Policy: users can only see their own bookmarks
create policy "Users can view own bookmarks"
  on public.bookmarks
  for select
  using (auth.uid() = user_id);

-- Policy: users can only insert their own bookmarks
create policy "Users can insert own bookmarks"
  on public.bookmarks
  for insert
  with check (auth.uid() = user_id);

-- Policy: users can only delete their own bookmarks
create policy "Users can delete own bookmarks"
  on public.bookmarks
  for delete
  using (auth.uid() = user_id);

-- Enable Realtime for the bookmarks table
-- (Also enable in Dashboard: Database > Replication > bookmarks)
alter publication supabase_realtime add table public.bookmarks;
