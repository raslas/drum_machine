import { INSTRUMENTS, STEPS } from './instruments'
import {
  DEFAULT_SYNTH_WAVE,
  emptyMelodyState,
  normalizeMelodyState,
  normalizeSynthWave,
  type MelodyState,
  type SynthWaveform,
} from './melody'

export interface SavedPattern {
  id: string
  name: string
  bpm: number
  seqState: boolean[][]
  melodyState: MelodyState
  synthWave: SynthWaveform
}

export interface SongData {
  patternIds: string[]
}

const PATTERNS_KEY = 'dm_patterns'
const SONG_KEY = 'dm_song'

export function normalizeSeqState(value: unknown): boolean[][] {
  const empty = emptySeqState()
  if (!Array.isArray(value)) return empty

  return INSTRUMENTS.map((_, rowIdx) => {
    const row = value[rowIdx]
    if (!Array.isArray(row)) return [...empty[rowIdx]]
    return Array.from({ length: STEPS }, (_, stepIdx) => Boolean(row[stepIdx]))
  })
}

export function normalizeSavedPattern(value: unknown): SavedPattern | null {
  if (!value || typeof value !== 'object') return null

  const raw = value as Partial<SavedPattern>
  if (typeof raw.id !== 'string' || typeof raw.name !== 'string') return null

  return {
    id: raw.id,
    name: raw.name,
    bpm: typeof raw.bpm === 'number' ? raw.bpm : 120,
    seqState: normalizeSeqState(raw.seqState),
    melodyState: normalizeMelodyState(raw.melodyState, STEPS),
    synthWave: normalizeSynthWave(raw.synthWave ?? DEFAULT_SYNTH_WAVE),
  }
}

export function loadPatterns(): SavedPattern[] {
  try {
    const raw = localStorage.getItem(PATTERNS_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return []
    return parsed
      .map(normalizeSavedPattern)
      .filter((pattern): pattern is SavedPattern => pattern !== null)
  } catch {
    return []
  }
}

export function savePattern(pattern: SavedPattern): void {
  const patterns = loadPatterns()
  const idx = patterns.findIndex(p => p.id === pattern.id)
  if (idx >= 0) {
    patterns[idx] = pattern
  } else {
    patterns.push(pattern)
  }
  localStorage.setItem(PATTERNS_KEY, JSON.stringify(patterns))
}

export function deletePattern(id: string): void {
  const patterns = loadPatterns().filter(p => p.id !== id)
  localStorage.setItem(PATTERNS_KEY, JSON.stringify(patterns))
}

export function loadSong(): SongData {
  try {
    const raw = localStorage.getItem(SONG_KEY)
    return raw ? (JSON.parse(raw) as SongData) : { patternIds: [] }
  } catch {
    return { patternIds: [] }
  }
}

export function saveSong(song: SongData): void {
  localStorage.setItem(SONG_KEY, JSON.stringify(song))
}

export function emptySeqState(): boolean[][] {
  return INSTRUMENTS.map(() => new Array(STEPS).fill(false))
}

export function emptyPatternMelody(): MelodyState {
  return emptyMelodyState(STEPS)
}

export interface ExportBundle {
  version: 1
  patterns: SavedPattern[]
  song: SongData
}

export function exportBundle(patterns: SavedPattern[], song: SongData): void {
  const bundle: ExportBundle = { version: 1, patterns, song }
  const blob = new Blob([JSON.stringify(bundle, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `drum-machine-${Date.now()}.json`
  a.click()
  URL.revokeObjectURL(url)
}

export function clearLocalPatterns(): void {
  localStorage.removeItem(PATTERNS_KEY)
}

export function importBundle(json: string): ExportBundle | null {
  try {
    const data = JSON.parse(json) as ExportBundle
    if (data.version !== 1 || !Array.isArray(data.patterns) || !data.song) return null
    data.patterns = data.patterns
      .map(normalizeSavedPattern)
      .filter((pattern): pattern is SavedPattern => pattern !== null)
    return data
  } catch {
    return null
  }
}
