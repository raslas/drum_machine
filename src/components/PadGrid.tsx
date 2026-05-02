'use client'

import type { Instrument } from '@/lib/instruments'
import Pad from './Pad'

interface PadGridProps {
  instruments: Instrument[]
  onPlay: (index: number) => void
}

export default function PadGrid({ instruments, onPlay }: PadGridProps) {
  return (
    <div className="grid grid-cols-4 gap-3 w-full max-width-3xl">
      {instruments.map((inst, i) => (
        <Pad
          key={inst.id}
          instrument={inst}
          onPlay={() => onPlay(i)}
        />
      ))}
    </div>
  )
}
