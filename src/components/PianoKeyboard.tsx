'use client'

import { useMemo, useRef, useState } from 'react'
import {
  buildPianoKeys,
  SYNTH_WAVES,
  type MelodyState,
  type SynthWaveform,
} from '@/lib/melody'

interface PianoKeyboardProps {
  wave: SynthWaveform
  recording: boolean
  activeStep: number
  selectedStep: number
  melodyState: MelodyState
  onWaveChange: (wave: SynthWaveform) => void
  onRecordingChange: (recording: boolean) => void
  onNoteStart: (note: string) => () => void
}

export default function PianoKeyboard({
  wave,
  recording,
  activeStep,
  selectedStep,
  melodyState,
  onWaveChange,
  onRecordingChange,
  onNoteStart,
}: PianoKeyboardProps) {
  const keys = useMemo(() => buildPianoKeys(), [])
  const whiteKeys = keys.filter(key => !key.isBlack)
  const blackKeys = keys.filter(key => key.isBlack)
  const whiteWidth = 100 / whiteKeys.length
  const stopsRef = useRef<Map<string, () => void>>(new Map())
  const [activeNotes, setActiveNotes] = useState<Set<string>>(() => new Set())

  function startNote(note: string, e: React.PointerEvent<HTMLButtonElement>) {
    e.preventDefault()
    e.currentTarget.setPointerCapture(e.pointerId)
    if (stopsRef.current.has(note)) return

    const stop = onNoteStart(note)
    stopsRef.current.set(note, stop)
    setActiveNotes(prev => new Set(prev).add(note))
  }

  function stopNote(note: string, e?: React.PointerEvent<HTMLButtonElement>) {
    e?.preventDefault()
    const stop = stopsRef.current.get(note)
    if (!stop) return

    stop()
    stopsRef.current.delete(note)
    setActiveNotes(prev => {
      const next = new Set(prev)
      next.delete(note)
      return next
    })
  }

  const armedStep = activeStep >= 0 ? activeStep : selectedStep

  return (
    <section
      className="rounded-2xl border p-4 flex flex-col gap-4"
      style={{ background: '#0c0c1a', borderColor: '#1a1a3a' }}
    >
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-[0.65rem] font-black uppercase tracking-[0.28em] text-[#00ffcc]">
            Melody Synth
          </span>
          <button
            type="button"
            onClick={() => onRecordingChange(!recording)}
            className="px-3 py-1.5 rounded-lg text-[0.65rem] font-black uppercase tracking-widest
                       transition-all duration-150 active:scale-95 focus-visible:outline-none
                       focus-visible:ring-2 focus-visible:ring-white/40"
            style={{
              background: recording ? 'linear-gradient(135deg, #ff2244, #ff00ff)' : '#111126',
              color: recording ? '#05050c' : '#555577',
              border: recording ? '1px solid #ff00ff' : '1px solid #333355',
              boxShadow: recording ? '0 0 14px #ff00ff55' : 'none',
            }}
          >
            REC
          </button>
          <span className="text-[0.62rem] font-bold uppercase tracking-widest text-[#444466]">
            Step {armedStep + 1}
          </span>
        </div>

        <div className="flex items-center gap-1 rounded-xl border border-[#1e1e3a] bg-[#090918] p-1">
          {SYNTH_WAVES.map(item => {
            const active = item.id === wave
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onWaveChange(item.id)}
                className="px-3 py-1.5 rounded-lg text-[0.62rem] font-black uppercase tracking-widest
                           transition-all duration-150 active:scale-95 focus-visible:outline-none
                           focus-visible:ring-2 focus-visible:ring-white/40"
                style={{
                  background: active ? 'linear-gradient(135deg, #00ffcc, #00aaff)' : 'transparent',
                  color: active ? '#05050c' : '#555577',
                }}
              >
                {item.label}
              </button>
            )
          })}
        </div>
      </div>

      <div className="overflow-x-auto pb-1">
        <div
          className="relative h-[132px] min-w-[720px] select-none"
          style={{ filter: 'drop-shadow(0 0 18px rgba(0,255,204,0.08))' }}
        >
          <div className="absolute inset-0 flex">
            {whiteKeys.map(key => {
              const isActive = activeNotes.has(key.note)
              const isRecorded = melodyState.includes(key.note)

              return (
                <button
                  key={key.note}
                  type="button"
                  onPointerDown={e => startNote(key.note, e)}
                  onPointerUp={e => stopNote(key.note, e)}
                  onPointerCancel={e => stopNote(key.note, e)}
                  className="relative h-full border border-[#1e1e3a] first:rounded-l-xl last:rounded-r-xl
                             transition-all duration-75 active:scale-[0.985] focus-visible:z-20
                             focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
                  style={{
                    width: `${whiteWidth}%`,
                    background: isActive
                      ? 'linear-gradient(180deg, #ffffff, #00ffcc)'
                      : isRecorded
                      ? 'linear-gradient(180deg, #eefcff, #d3fff4)'
                      : 'linear-gradient(180deg, #f9fbff, #bfc8d8)',
                    boxShadow: isActive
                      ? 'inset 0 -12px 24px #00aaff66, 0 0 18px #00ffcc88'
                      : isRecorded
                      ? 'inset 0 -8px 18px #ff00ff33'
                      : 'inset 0 -10px 16px rgba(0,0,0,0.28)',
                  }}
                >
                  <span
                    className="absolute bottom-3 left-1/2 -translate-x-1/2 text-[0.65rem] font-black"
                    style={{ color: isRecorded ? '#aa00cc' : '#111126' }}
                  >
                    {key.note}
                  </span>
                </button>
              )
            })}
          </div>

          {blackKeys.map(key => {
            const isActive = activeNotes.has(key.note)
            const isRecorded = melodyState.includes(key.note)

            return (
              <button
                key={key.note}
                type="button"
                onPointerDown={e => startNote(key.note, e)}
                onPointerUp={e => stopNote(key.note, e)}
                onPointerCancel={e => stopNote(key.note, e)}
                className="absolute top-0 z-10 h-[84px] rounded-b-lg border transition-all duration-75
                           active:scale-[0.975] focus-visible:outline-none focus-visible:ring-2
                           focus-visible:ring-white/40"
                style={{
                  left: `${(key.whiteIndex + 1) * whiteWidth}%`,
                  width: `${whiteWidth * 0.62}%`,
                  transform: 'translateX(-50%)',
                  background: isActive
                    ? 'linear-gradient(180deg, #00ffcc, #111126)'
                    : isRecorded
                    ? 'linear-gradient(180deg, #40145a, #05050c)'
                    : 'linear-gradient(180deg, #1b1b32, #05050c)',
                  borderColor: isActive ? '#00ffcc' : isRecorded ? '#ff00ff' : '#333355',
                  boxShadow: isActive ? '0 0 18px #00ffccaa' : '0 8px 14px rgba(0,0,0,0.42)',
                }}
              >
                <span className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[0.56rem] font-black text-white/80">
                  {key.note}
                </span>
              </button>
            )
          })}
        </div>
      </div>
    </section>
  )
}
