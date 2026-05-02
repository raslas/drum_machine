'use client'

import { useEffect, useRef } from 'react'
import type { MutableRefObject } from 'react'
import { playSound } from '@/lib/sounds'
import type { Instrument } from '@/lib/instruments'

interface UseSequencerProps {
  ctxRef: MutableRefObject<AudioContext | null>
  seqStateRef: MutableRefObject<boolean[][]>
  bpmRef: MutableRefObject<number>
  instruments: Instrument[]
  isPlaying: boolean
  onStepChange: (step: number) => void
  onLoopEnd?: () => void
}

const LOOKAHEAD_SEC = 0.1
const TICK_MS = 25

export function useSequencer({
  ctxRef,
  seqStateRef,
  bpmRef,
  instruments,
  isPlaying,
  onStepChange,
  onLoopEnd,
}: UseSequencerProps) {
  const onStepRef   = useRef(onStepChange)
  const onLoopRef   = useRef(onLoopEnd)
  const stepRef     = useRef(0)
  const nextTimeRef = useRef(0)
  const timerRef    = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => { onStepRef.current  = onStepChange }, [onStepChange])
  useEffect(() => { onLoopRef.current  = onLoopEnd },    [onLoopEnd])

  useEffect(() => {
    if (!isPlaying) return

    const ctx = ctxRef.current
    if (!ctx) return

    stepRef.current     = 0
    nextTimeRef.current = ctx.currentTime

    const tick = () => {
      const secPerStep = 60 / bpmRef.current / 2 // 8th-note grid

      while (nextTimeRef.current < ctx.currentTime + LOOKAHEAD_SEC) {
        const step = stepRef.current
        const t    = nextTimeRef.current

        instruments.forEach((inst, i) => {
          if (seqStateRef.current[i]?.[step]) {
            playSound(inst.id, ctx, t)
          }
        })

        const msDelay = Math.max(0, (t - ctx.currentTime) * 1000 - 15)
        setTimeout(() => onStepRef.current(step), msDelay)

        // Signal end-of-loop synchronously so song mode can swap seqStateRef
        // before the next iteration schedules step 0
        if (step === 7) {
          onLoopRef.current?.()
        }

        nextTimeRef.current += secPerStep
        stepRef.current = (stepRef.current + 1) % 8
      }

      timerRef.current = setTimeout(tick, TICK_MS)
    }

    tick()

    return () => {
      if (timerRef.current !== null) clearTimeout(timerRef.current)
      onStepRef.current(-1)
    }
  }, [isPlaying, ctxRef, instruments, seqStateRef, bpmRef])
}
