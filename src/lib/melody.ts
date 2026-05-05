export type SynthWaveform = 'sine' | 'sawtooth' | 'square'
export type MelodyState = Array<string | null>

export interface PianoKey {
  note: string
  midi: number
  frequency: number
  isBlack: boolean
  whiteIndex: number
}

export const SYNTH_WAVES: Array<{ id: SynthWaveform; label: string }> = [
  { id: 'sine', label: 'Sine' },
  { id: 'sawtooth', label: 'Saw' },
  { id: 'square', label: 'Square' },
]

const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
const BLACK_NOTES = new Set(['C#', 'D#', 'F#', 'G#', 'A#'])

export const DEFAULT_SYNTH_WAVE: SynthWaveform = 'sawtooth'

export function noteToFrequency(note: string): number {
  const match = /^([A-G]#?)(-?\d+)$/.exec(note)
  if (!match) return 440

  const [, name, octaveRaw] = match
  const octave = Number(octaveRaw)
  const noteIndex = NOTE_NAMES.indexOf(name)
  if (noteIndex < 0) return 440

  const midi = (octave + 1) * 12 + noteIndex
  return 440 * 2 ** ((midi - 69) / 12)
}

function isValidNote(note: string): boolean {
  const match = /^([A-G]#?)(-?\d+)$/.exec(note)
  return Boolean(match && NOTE_NAMES.includes(match[1]))
}

export function buildPianoKeys(startMidi = 48, endMidi = 72): PianoKey[] {
  let whiteIndex = -1

  return Array.from({ length: endMidi - startMidi + 1 }, (_, i) => {
    const midi = startMidi + i
    const name = NOTE_NAMES[midi % 12]
    const octave = Math.floor(midi / 12) - 1
    const isBlack = BLACK_NOTES.has(name)

    if (!isBlack) whiteIndex += 1

    return {
      note: `${name}${octave}`,
      midi,
      frequency: 440 * 2 ** ((midi - 69) / 12),
      isBlack,
      whiteIndex,
    }
  })
}

export function emptyMelodyState(steps: number): MelodyState {
  return new Array(steps).fill(null)
}

export function normalizeMelodyState(value: unknown, steps: number): MelodyState {
  if (!Array.isArray(value)) return emptyMelodyState(steps)

  return Array.from({ length: steps }, (_, i) => {
    const note = value[i]
    return typeof note === 'string' && isValidNote(note) ? note : null
  })
}

export function normalizeSynthWave(value: unknown): SynthWaveform {
  return value === 'sine' || value === 'sawtooth' || value === 'square'
    ? value
    : DEFAULT_SYNTH_WAVE
}
