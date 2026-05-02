export interface Instrument {
  id: string
  name: string
  color: string // neon hex
}

export const INSTRUMENTS: Instrument[] = [
  // Row 1 — core drums
  { id: 'kick',    name: 'Kick',     color: '#ff2244' },
  { id: 'snare',   name: 'Snare',    color: '#ff6600' },
  { id: 'hihat',   name: 'Hi-Hat',   color: '#00ffcc' },
  { id: 'openhat', name: 'Open Hat', color: '#00aaff' },
  // Row 2 — hits
  { id: 'clap',    name: 'Clap',     color: '#ffee00' },
  { id: 'rim',     name: 'Rim',      color: '#ff00ff' },
  { id: 'lowtom',  name: 'Low Tom',  color: '#ff44aa' },
  { id: 'midtom',  name: 'Mid Tom',  color: '#bb44ff' },
  // Row 3 — percussion
  { id: 'hitom',   name: 'Hi Tom',   color: '#44ffaa' },
  { id: 'cowbell', name: 'Cowbell',  color: '#ffaa00' },
  { id: 'cymbal',  name: 'Cymbal',   color: '#00ffff' },
  { id: 'shaker',  name: 'Shaker',   color: '#aaffee' },
  // Row 4 — synth / bass
  { id: 'subbass', name: 'Sub Bass', color: '#ff3300' },
  { id: 'bass',    name: 'Bass',     color: '#ff8800' },
  { id: 'synth',   name: 'Synth',    color: '#cc00ff' },
  { id: 'noise',   name: 'Noise',    color: '#7799ff' },
]

export const STEPS = 8
