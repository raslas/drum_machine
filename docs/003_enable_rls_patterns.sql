-- 003_enable_rls_patterns.sql
-- Enables Row Level Security on the patterns table and creates a policy
-- so each user can only read, insert, update, and delete their own rows.
--
-- Run after 001_create_patterns_table.sql.

alter table patterns enable row level security;

create policy "patterns: owner access"
  on patterns
  for all
  using     (auth.uid() = user_id)
  with check (auth.uid() = user_id);
