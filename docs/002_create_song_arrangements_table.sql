-- 002_create_song_arrangements_table.sql
-- Creates the song_arrangements table.
-- Each user has at most one row: an ordered list of pattern IDs that
-- defines their song sequence.
--
-- Run after 001_create_patterns_table.sql.

create table if not exists song_arrangements (
  user_id      uuid    primary key references auth.users(id) on delete cascade,
  pattern_ids  text[]  not null default '{}',   -- ordered array of pattern UUIDs
  updated_at   timestamptz not null default now()
);
