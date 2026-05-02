'use client'

import type { Instrument } from '@/lib/instruments'

interface SequencerProps {
  instruments: Instrument[]
  seqState: boolean[][]
  activeStep: number  // -1 when stopped
  onToggle: (instIdx: number, step: number) => void
}

const STEPS = 8

export default function Sequencer({
  instruments,
  seqState,
  activeStep,
  onToggle,
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
      </div>
    </div>
  )
}
