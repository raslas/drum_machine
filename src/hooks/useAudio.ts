'use client'

import { useRef, useCallback } from 'react'

export function useAudio() {
  const ctxRef = useRef<AudioContext | null>(null)

  /**
   * Returns the shared AudioContext, creating it on first call.
   * Must be called inside a user-gesture handler (browser policy).
   */
  const getCtx = useCallback((): AudioContext => {
    if (!ctxRef.current) {
      const AC = window.AudioContext ?? (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
      ctxRef.current = new AC()
    }
    if (ctxRef.current.state === 'suspended') {
      ctxRef.current.resume()
    }
    return ctxRef.current
  }, [])

  return { getCtx, ctxRef }
}
