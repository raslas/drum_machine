'use client'

import type { Instrument } from '@/lib/instruments'
import type { MelodyState } from '@/lib/melody'

interface SequencerProps {
  instruments: Instrument[]
  seqState: boolean[][]
  melodyState: MelodyState
  activeStep: number  // -1 when stopped
  selectedMelodyStep: number
  onToggle: (instIdx: number, step: number) => void
  onMelodyStepClick: (step: number) => void
}

const STEPS = 8

export default function Sequencer({
  instruments,
  seqState,
  melodyState,
  activeStep,
  selectedMelodyStep,
  onToggle,
  onMelodyStepClick,
}: SequencerProps) {
  return (
    <div className="overflow-x-auto">
      {/* Beat numbers header */}
      <div className="flex items-center mb-2" style={{ paddingLeft: '88px' }}>
        {Array.from({ length: STEPS }, (_, s) => (
          <div key={s} className="flex items-center" style={{ flex: 1 }}>
            {/* Visual gap between beat 4 and 5 */}
            {s === 4 && <div className="w-2 flex-shrink-0" />}
            <div
              className="text-center text-[0.58rem] font-bold tracking-widest"
              style={{
                flex: 1,
                color: s === activeStep ? '#ffffff' : '#2a2a4a',
              }}
            >
              {s + 1}
            </div>
          </div>
        ))}
      </div>

      {/* One row per instrument */}
      <div className="flex flex-col gap-[5px]">
        {instruments.map((inst, i) => (
          <div key={inst.id} className="flex items-center gap-0">
            {/* Instrument label */}
            <div
              className="text-right text-[0.62rem] font-black uppercase tracking-wide pr-2 flex-shrink-0"
              style={{ width: '88px', color: inst.color }}
            >
              {inst.name}
            </div>

            {/* Step buttons */}
            {Array.from({ length: STEPS }, (_, s) => {
              const on     = seqState[i]?.[s] ?? false
              const active = s === activeStep

              return (
                <div key={s} className="flex items-center" style={{ flex: 1 }}>
                  {/* Measure separator gap */}
                  {s === 4 && <div className="w-2 flex-shrink-0" />}

                  <button
                    onClick={() => onToggle(i, s)}
                    className="rounded-md transition-all duration-75 cursor-pointer
                               focus-visible:outline-none"
                    style={{
                      flex: 1,
                      height: '30px',
                      border: active
                        ? '2px solid rgba(255,255,255,0.75)'
                        : on
                        ? `2px solid ${inst.color}`
                        : '1.5px solid #1e1e3a',
                      background: on
                        ? inst.color
                        : active
                        ? '#1e1e3a'
                        : '#0e0e22',
                      boxShadow: on
                        ? `0 0 8px ${inst.color}66`
                        : 'none',
                      outlineOffset: active ? '1px' : undefined,
                    }}
                  />
                </div>
              )
            })}
          </div>
        ))}

        <div className="flex items-center gap-0 pt-2 mt-1 border-t border-[#1a1a3a]">
          <div
            className="text-right text-[0.62rem] font-black uppercase tracking-wide pr-2 flex-shrink-0"
            style={{ width: '88px', color: '#00ffcc' }}
          >
            Melody
          </div>

          {Array.from({ length: STEPS }, (_, s) => {
            const note = melodyState[s]
            const active = s === activeStep
            const selected = activeStep < 0 && s === selectedMelodyStep

            return (
              <div key={s} className="flex items-center" style={{ flex: 1 }}>
                {s === 4 && <div className="w-2 flex-shrink-0" />}

                <button
                  onClick={() => onMelodyStepClick(s)}
                  className="rounded-md transition-all duration-75 cursor-pointer
                             focus-visible:outline-none flex items-center justify-center overflow-hidden"
                  style={{
                    flex: 1,
                    height: '34px',
                    border: active
                      ? '2px solid rgba(255,255,255,0.75)'
                      : note
                      ? '2px solid #00ffcc'
                      : selected
                      ? '1.5px solid #ff00ff'
                      : '1.5px solid #1e1e3a',
                    background: note
                      ? 'linear-gradient(135deg, #00ffcc, #00aaff)'
                      : active
                      ? '#1e1e3a'
                      : selected
                      ? '#190e2a'
                      : '#0e0e22',
                    boxShadow: note ? '0 0 9px #00ffcc66' : selected ? '0 0 8px #ff00ff44' : 'none',
                    color: note ? '#05050c' : selected ? '#ff00ff' : '#2a2a4a',
                  }}
                  title={note ? `Clear ${note}` : `Select step ${s + 1}`}
                >
                  <span className="text-[0.58rem] font-black tabular-nums leading-none">
                    {note ?? '...'}
                  </span>
                </button>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
