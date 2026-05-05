import { supabase } from './supabase'
import { normalizeSavedPattern, type SavedPattern, type SongData } from './patternStore'

export async function fetchPatterns(userId: string): Promise<SavedPattern[]> {
  const { data, error } = await supabase
    .from('patterns')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: true })

  if (error) throw error

  return (data ?? [])
    .map(row => normalizeSavedPattern({
      id: row.id,
      name: row.name,
      bpm: row.bpm,
      seqState: row.seq_state,
      melodyState: row.melody_state,
      synthWave: row.synth_wave,
    }))
    .filter((pattern): pattern is SavedPattern => pattern !== null)
}

export async function upsertPattern(userId: string, pattern: SavedPattern): Promise<void> {
  const { error } = await supabase.from('patterns').upsert({
    id: pattern.id,
    user_id: userId,
    name: pattern.name,
    bpm: pattern.bpm,
    seq_state: pattern.seqState,
    melody_state: pattern.melodyState,
    synth_wave: pattern.synthWave,
    updated_at: new Date().toISOString(),
  })
  if (error) throw error
}

export async function removePattern(id: string): Promise<void> {
  const { error } = await supabase.from('patterns').delete().eq('id', id)
  if (error) throw error
}

export async function fetchSong(userId: string): Promise<SongData> {
  const { data, error } = await supabase
    .from('song_arrangements')
    .select('pattern_ids')
    .eq('user_id', userId)
    .maybeSingle()

  if (error) throw error
  return { patternIds: (data?.pattern_ids as string[]) ?? [] }
}

export async function upsertSong(userId: string, song: SongData): Promise<void> {
  const { error } = await supabase.from('song_arrangements').upsert({
    user_id: userId,
    pattern_ids: song.patternIds,
    updated_at: new Date().toISOString(),
  })
  if (error) throw error
}
