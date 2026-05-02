import { INSTRUMENTS, STEPS } from './instruments'

export interface SavedPattern {
  id: string
  name: string
  bpm: number
  seqState: boolean[][]
}

export interface SongData {
  patternIds: string[]
}

const PATTERNS_KEY = 'dm_patterns'
const SONG_KEY = 'dm_song'

export function loadPatterns(): SavedPattern[] {
  try {
    const raw = localStorage.getItem(PATTERNS_KEY)
    return raw ? (JSON.parse(raw) as SavedPattern[]) : []
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
    return data
  } catch {
    return null
  }
}
