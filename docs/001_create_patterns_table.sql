-- 001_create_patterns_table.sql
-- Creates the patterns table.
-- Each row is one saved drum pattern belonging to a user.
--
-- Run this first, before any other migration.

create table if not exists patterns (
  id          uuid        primary key default gen_random_uuid(),
  user_id     uuid        not null references auth.users(id) on delete cascade,
  name        text        not null,
  bpm         integer     not null default 120,
  seq_state   jsonb       not null,   -- boolean[][] stored as JSON (16 instruments × 8 steps)
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
