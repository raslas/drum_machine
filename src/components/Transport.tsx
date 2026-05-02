'use client'

interface TransportProps {
  isPlaying: boolean
  bpm: number
  songMode: boolean
  currentPatternName: string
  onPlayStop: () => void
  onBpmChange: (bpm: number) => void
  onClear: () => void
}

export default function Transport({
  isPlaying,
  bpm,
  songMode,
  currentPatternName,
  onPlayStop,
  onBpmChange,
  onClear,
}: TransportProps) {
  return (
    <div className="flex flex-col gap-3 mb-5">
      <div className="flex items-center gap-3 flex-wrap">
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

        {/* Pattern name indicator */}
        <div className="flex items-center gap-2">
          {songMode && (
            <span
              className="text-[0.6rem] font-black uppercase tracking-widest px-2 py-1 rounded-md"
              style={{ background: '#1a1800', color: '#ffee00', border: '1px solid #ffee0044' }}
            >
              Song
            </span>
          )}
          <span className="text-[0.68rem] font-bold text-[#555577] truncate max-w-[160px]">
            {currentPatternName}
          </span>
        </div>

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
    </div>
  )
}
