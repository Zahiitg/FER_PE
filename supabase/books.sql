-- supabase/books.sql
-- Idempotent: safe to run multiple times

create table if not exists public.books (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null default auth.uid() references auth.users(id) on delete cascade,
  title      text not null check (title ~ '\S' and char_length(title) <= 80),
  author     text not null check (author ~ '\S' and char_length(author) <= 60),
  pages      integer not null check (pages between 1 and 5000),
  status     text not null default 'To Read' check (status in ('To Read','Reading','Finished')),
  created_at timestamptz not null default now()
);

create index if not exists books_user_idx on public.books (user_id, created_at desc);

alter table public.books enable row level security;

drop policy if exists "books select own" on public.books;
drop policy if exists "books insert own" on public.books;
drop policy if exists "books update own" on public.books;
drop policy if exists "books delete own" on public.books;

create policy "books select own" on public.books
  for select to authenticated using (auth.uid() = user_id);
create policy "books insert own" on public.books
  for insert to authenticated with check (auth.uid() = user_id);
create policy "books update own" on public.books
  for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "books delete own" on public.books
  for delete to authenticated using (auth.uid() = user_id);

-- Restrict update to only the status column
revoke update on public.books from anon, authenticated;
grant select, insert, delete on public.books to authenticated;
grant update (status) on public.books to authenticated;

