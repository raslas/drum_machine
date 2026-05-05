-- 005_add_melody_synth_to_patterns.sql
-- Adds melody sequencer data and waveform selection to saved patterns.
--
-- Run after 004_enable_rls_song_arrangements.sql.

alter table patterns
  add column if not exists melody_state jsonb not null default
    '[null, null, null, null, null, null, null, null]'::jsonb,
  add column if not exists synth_wave text not null default 'sawtooth';

alter table patterns
  drop constraint if exists patterns_synth_wave_check,
  add constraint patterns_synth_wave_check
    check (synth_wave in ('sine', 'sawtooth', 'square'));
