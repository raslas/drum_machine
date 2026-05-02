-- 004_enable_rls_song_arrangements.sql
-- Enables Row Level Security on the song_arrangements table and creates
-- a policy so each user can only read and modify their own song sequence.
--
-- Run after 002_create_song_arrangements_table.sql.

alter table song_arrangements enable row level security;

create policy "song_arrangements: owner access"
  on song_arrangements
  for all
  using     (auth.uid() = user_id)
  with check (auth.uid() = user_id);
