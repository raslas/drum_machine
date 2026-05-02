'use client'

import { useState, useRef } from 'react'
import type { Instrument } from '@/lib/instruments'

interface PadProps {
  instrument: Instrument
  onPlay: () => void
}

interface Ripple {
  id: number
  x: number
  y: number
}

export default function Pad({ instrument, onPlay }: PadProps) {
  const [animKey, setAnimKey] = useState(0)
  const [ripples, setRipples] = useState<Ripple[]>([])
  const rippleId = useRef(0)

  const handlePointerDown = (e: React.PointerEvent<HTMLButtonElement>) => {
    onPlay()

    // Increment animKey so the flash overlay re-mounts → animation restarts
    setAnimKey(k => k + 1)

    // Ripple origin relative to the pad
    const rect = e.currentTarget.getBoundingClientRect()
    const id = ++rippleId.current
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    setRipples(prev => [...prev, { id, x, y }])
    setTimeout(() => setRipples(prev => prev.filter(r => r.id !== id)), 460)
  }

  const { color, name } = instrument

  return (
    <button
      onPointerDown={handlePointerDown}
      className="relative overflow-hidden rounded-2xl border-2 flex items-center justify-center
                 aspect-square select-none cursor-pointer
                 transition-transform duration-75 active:scale-[0.91]
                 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
      style={{
        borderColor: color,
        background: `color-mix(in srgb, ${color} 13%, #06060f)`,
      }}
    >
      {/* Pad label */}
      <span
        className="text-[clamp(0.55rem,1.1vw,0.78rem)] font-black uppercase tracking-wider z-10 pointer-events-none"
        style={{ color }}
      >
        {name}
      </span>

      {/* Hit flash overlay — re-mounts on each hit to restart the animation */}
      {animKey > 0 && (
        <span
          key={animKey}
          className="absolute inset-0 rounded-[inherit] animate-pad-flash pointer-events-none"
          style={{ '--pad-glow': color + '88' } as React.CSSProperties}
        />
      )}

      {/* Ripple elements */}
      {ripples.map(r => (
        <span
          key={r.id}
          className="absolute w-3 h-3 -translate-x-1/2 -translate-y-1/2 rounded-full
                     bg-white/30 animate-ripple pointer-events-none"
          style={{ left: r.x, top: r.y }}
        />
      ))}
    </button>
  )
}
