'use client'

import { useEffect, useRef } from 'react'
import type { MutableRefObject } from 'react'
import { playSound } from '@/lib/sounds'
import type { Instrument } from '@/lib/instruments'

interface UseSequencerProps {
  ctxRef: MutableRefObject<AudioContext | null>
  seqStateRef: MutableRefObject<boolean[][]>
  instruments: Instrument[]
  bpm: number
  isPlaying: boolean
  onStepChange: (step: number) => void
}

const LOOKAHEAD_SEC = 0.1 // seconds ahead to schedule audio
const TICK_MS = 25        // scheduler poll interval

export function useSequencer({
  ctxRef,
  seqStateRef,
  instruments,
  bpm,
  isPlaying,
  onStepChange,
}: UseSequencerProps) {
  // Refs keep values fresh inside the scheduler closure without causing re-renders
  const bpmRef       = useRef(bpm)
  const onStepRef    = useRef(onStepChange)
  const stepRef      = useRef(0)
  const nextTimeRef  = useRef(0)
  const timerRef     = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => { bpmRef.current = bpm },            [bpm])
  useEffect(() => { onStepRef.current = onStepChange }, [onStepChange])

  useEffect(() => {
    if (!isPlaying) return

    const ctx = ctxRef.current
    if (!ctx) return

    // Reset position
    stepRef.current    = 0
    nextTimeRef.current = ctx.currentTime

    const tick = () => {
      const secPerStep = 60 / bpmRef.current / 2 // 8th-note grid

      while (nextTimeRef.current < ctx.currentTime + LOOKAHEAD_SEC) {
        const step = stepRef.current
        const t    = nextTimeRef.current

        // Schedule audio for each active instrument
        instruments.forEach((inst, i) => {
          if (seqStateRef.current[i]?.[step]) {
            playSound(inst.id, ctx, t)
          }
        })

        // Fire visual update just before the beat sounds
        const msDelay = Math.max(0, (t - ctx.currentTime) * 1000 - 15)
        setTimeout(() => onStepRef.current(step), msDelay)

        nextTimeRef.current += secPerStep
        stepRef.current = (stepRef.current + 1) % 8
      }

      timerRef.current = setTimeout(tick, TICK_MS)
    }

    tick()

    return () => {
      if (timerRef.current !== null) clearTimeout(timerRef.current)
      onStepRef.current(-1) // clear playhead on stop
    }
  }, [isPlaying, ctxRef, instruments, seqStateRef])
}
