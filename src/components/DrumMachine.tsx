'use client'

import { useState, useRef, useCallback } from 'react'
import { INSTRUMENTS, STEPS } from '@/lib/instruments'
import { playSound } from '@/lib/sounds'
import { useAudio } from '@/hooks/useAudio'
import { useSequencer } from '@/hooks/useSequencer'
import PadGrid from './PadGrid'
import Sequencer from './Sequencer'
import Transport from './Transport'

export default function DrumMachine() {
  const { getCtx, ctxRef } = useAudio()

  // ── Sequencer state (16 instruments × 8 steps) ──────────────────────────
  const [seqState, setSeqState] = useState<boolean[][]>(
    () => INSTRUMENTS.map(() => new Array(STEPS).fill(false))
  )

  // Mirror ref — read inside scheduler closure without stale closures
  const seqStateRef = useRef<boolean[][]>(seqState)

  const handleToggle = useCallback((instIdx: number, step: number) => {
    setSeqState(prev => {
      const next = prev.map(row => [...row])
      next[instIdx][step] = !next[instIdx][step]
      seqStateRef.current = next // keep ref in sync atomically
      return next
    })
  }, [])

  const handleClear = useCallback(() => {
    const cleared = INSTRUMENTS.map(() => new Array(STEPS).fill(false))
    setSeqState(cleared)
    seqStateRef.current = cleared
  }, [])

  // ── Transport ────────────────────────────────────────────────────────────
  const [isPlaying, setIsPlaying] = useState(false)
  const [bpm, setBpm] = useState(120)
  const [activeStep, setActiveStep] = useState(-1)

  const handlePlayStop = useCallback(() => {
    if (!isPlaying) {
      // Ensure AudioContext is created/resumed on user gesture before sequencer starts
      getCtx()
    }
    setIsPlaying(prev => !prev)
  }, [isPlaying, getCtx])

  // ── Sequencer clock ──────────────────────────────────────────────────────
  useSequencer({
    ctxRef,
    seqStateRef,
    instruments: INSTRUMENTS,
    bpm,
    isPlaying,
    onStepChange: setActiveStep,
  })

  // ── Pad hit ──────────────────────────────────────────────────────────────
  const handlePadPlay = useCallback((instIdx: number) => {
    const ctx = getCtx()
    playSound(INSTRUMENTS[instIdx].id, ctx, ctx.currentTime)
  }, [getCtx])

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="w-full max-w-3xl flex flex-col gap-8">
      {/* ── Header ── */}
      <header className="text-center select-none">
        <h1
          className="text-4xl font-black uppercase tracking-[0.35em]"
          style={{
            background: 'linear-gradient(90deg, #ff2244, #ff00ff, #00ffcc, #00aaff)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          Drum Machine
        </h1>
        <p className="mt-1 text-[0.65rem] font-bold uppercase tracking-[0.28em] text-[#2a2a4a]">
          Web Audio Synthesizer
        </p>
      </header>

      {/* ── Pad grid ── */}
      <PadGrid instruments={INSTRUMENTS} onPlay={handlePadPlay} />

      {/* ── Sequencer card ── */}
      <section
        className="rounded-2xl border p-5"
        style={{ background: '#0c0c1a', borderColor: '#1a1a3a' }}
      >
        <Transport
          isPlaying={isPlaying}
          bpm={bpm}
          onPlayStop={handlePlayStop}
          onBpmChange={setBpm}
          onClear={handleClear}
        />
        <Sequencer
          instruments={INSTRUMENTS}
          seqState={seqState}
          activeStep={activeStep}
          onToggle={handleToggle}
        />
      </section>
    </div>
  )
}
