'use client'

interface TransportProps {
  isPlaying: boolean
  bpm: number
  onPlayStop: () => void
  onBpmChange: (bpm: number) => void
  onClear: () => void
}

export default function Transport({
  isPlaying,
  bpm,
  onPlayStop,
  onBpmChange,
  onClear,
}: TransportProps) {
  return (
    <div className="flex items-center gap-3 flex-wrap mb-5">
      {/* Play / Stop */}
      <button
        onClick={onPlayStop}
        className="px-6 py-2.5 rounded-xl font-black text-sm uppercase tracking-widest text-black
                   transition-all duration-150 hover:scale-105 active:scale-95
                   focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
        style={{
          background: isPlaying
            ? 'linear-gradient(135deg, #ff2244, #ff00aa)'
            : 'linear-gradient(135deg, #00ffcc, #00aaff)',
        }}
      >
        {isPlaying ? '■  Stop' : '▶  Play'}
      </button>

      {/* Clear */}
      <button
        onClick={onClear}
        className="px-4 py-2.5 rounded-xl font-bold text-sm uppercase tracking-widest
                   border border-[#333355] text-[#555577]
                   hover:border-[#ff2244] hover:text-[#ff2244]
                   transition-colors duration-150
                   focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
      >
        Clear
      </button>

      {/* BPM */}
      <div className="flex items-center gap-3 ml-auto">
        <label className="text-[0.68rem] font-bold uppercase tracking-widest text-[#444466]">
          BPM
        </label>
        <input
          type="range"
          min={60}
          max={240}
          value={bpm}
          onChange={e => onBpmChange(Number(e.target.value))}
          className="w-28"
        />
        <span className="text-[#00ffcc] font-black text-sm min-w-[3ch] tabular-nums">
          {bpm}
        </span>
      </div>
    </div>
  )
}
