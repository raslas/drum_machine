'use client'

import type { SavedPattern } from '@/lib/patternStore'

interface SongModeProps {
  savedPatterns: SavedPattern[]
  songArrangement: string[]      // ordered list of pattern IDs
  currentSongIdx: number         // which slot is active during playback
  isPlaying: boolean
  songMode: boolean
  onToggleSongMode: () => void
  onAddToSong: (patternId: string) => void
  onRemoveFromSong: (index: number) => void
  onMoveUp: (index: number) => void
  onMoveDown: (index: number) => void
  onClearSong: () => void
}

export default function SongMode({
  savedPatterns,
  songArrangement,
  currentSongIdx,
  isPlaying,
  songMode,
  onToggleSongMode,
  onAddToSong,
  onRemoveFromSong,
  onMoveUp,
  onMoveDown,
  onClearSong,
}: SongModeProps) {
  function patternName(id: string) {
    return savedPatterns.find(p => p.id === id)?.name ?? '???'
  }
  function patternBpm(id: string) {
    return savedPatterns.find(p => p.id === id)?.bpm ?? '—'
  }

  return (
    <div
      className="rounded-2xl border p-5 flex flex-col gap-4"
      style={{ background: '#0c0c1a', borderColor: '#1a1a3a' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <span
          className="text-[0.65rem] font-black uppercase tracking-[0.28em]"
          style={{ color: '#ffee00' }}
        >
          Song Mode
        </span>

        <div className="flex items-center gap-2">
          {songArrangement.length > 0 && (
            <button
              onClick={onClearSong}
              className="px-3 py-1.5 rounded-lg text-[0.65rem] font-bold uppercase tracking-widest border
                         border-[#333355] text-[#555577] hover:border-[#ff2244] hover:text-[#ff2244]
                         transition-colors duration-150"
            >
              Clear
            </button>
          )}

          {/* Song mode toggle */}
          <button
            onClick={onToggleSongMode}
            className="px-5 py-1.5 rounded-xl text-[0.7rem] font-black uppercase tracking-widest
                       text-black transition-all duration-150 hover:scale-105 active:scale-95"
            style={{
              background: songMode
                ? 'linear-gradient(135deg, #ffee00, #ff8800)'
                : 'linear-gradient(135deg, #333355, #222244)',
              color: songMode ? 'black' : '#555577',
              border: songMode ? 'none' : '1px solid #333355',
            }}
          >
            {songMode ? '● Song Mode ON' : '○ Song Mode OFF'}
          </button>
        </div>
      </div>

      {/* Song arrangement */}
      {songArrangement.length === 0 ? (
        <p className="text-[0.65rem] text-[#2a2a4a] uppercase tracking-widest">
          Add patterns below to build a song sequence
        </p>
      ) : (
        <div className="flex flex-col gap-1.5 max-h-52 overflow-y-auto pr-1">
          {songArrangement.map((id, idx) => {
            const isActive = songMode && isPlaying && idx === currentSongIdx
            return (
              <div
                key={`${id}-${idx}`}
                className="flex items-center gap-2 px-3 py-2 rounded-xl transition-all duration-150"
                style={{
                  background: isActive ? '#1a1a2a' : '#0e0e22',
                  border: `1.5px solid ${isActive ? '#ffee00' : '#1e1e3a'}`,
                  boxShadow: isActive ? '0 0 10px #ffee0040' : 'none',
                }}
              >
                {/* Slot number */}
                <span
                  className="text-[0.6rem] font-black tabular-nums w-5 text-right flex-shrink-0"
                  style={{ color: isActive ? '#ffee00' : '#2a2a4a' }}
                >
                  {idx + 1}
                </span>

                {/* Pattern name */}
                <span
                  className="flex-1 text-sm font-bold truncate"
                  style={{ color: isActive ? '#ffee00' : '#8888aa' }}
                >
                  {patternName(id)}
                </span>

                {/* BPM */}
                <span className="text-[0.6rem] font-bold tabular-nums flex-shrink-0" style={{ color: '#2a2a4a' }}>
                  {patternBpm(id)} BPM
                </span>

                {/* Playhead indicator */}
                {isActive && (
                  <span className="text-[0.65rem] font-black flex-shrink-0" style={{ color: '#ffee00' }}>
                    ▶
                  </span>
                )}

                {/* Move / remove controls */}
                <div className="flex gap-1 flex-shrink-0">
                  <button
                    onClick={() => onMoveUp(idx)}
                    disabled={idx === 0}
                    className="w-6 h-6 rounded flex items-center justify-center text-[0.65rem]
                               border border-[#333355] text-[#555577] disabled:opacity-20
                               hover:border-[#8888aa] hover:text-white transition-colors"
                  >
                    ▲
                  </button>
                  <button
                    onClick={() => onMoveDown(idx)}
                    disabled={idx === songArrangement.length - 1}
                    className="w-6 h-6 rounded flex items-center justify-center text-[0.65rem]
                               border border-[#333355] text-[#555577] disabled:opacity-20
                               hover:border-[#8888aa] hover:text-white transition-colors"
                  >
                    ▼
                  </button>
                  <button
                    onClick={() => onRemoveFromSong(idx)}
                    className="w-6 h-6 rounded flex items-center justify-center text-[0.65rem]
                               border border-[#333355] text-[#555577]
                               hover:border-[#ff2244] hover:text-[#ff2244] transition-colors"
                  >
                    ✕
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Add pattern buttons */}
      {savedPatterns.length === 0 ? (
        <p className="text-[0.65rem] text-[#2a2a4a] uppercase tracking-widest">
          Save patterns in the library above to add them here
        </p>
      ) : (
        <div>
          <p className="text-[0.6rem] font-bold uppercase tracking-widest text-[#2a2a4a] mb-2">
            Add to sequence:
          </p>
          <div className="flex flex-wrap gap-2">
            {savedPatterns.map(p => (
              <button
                key={p.id}
                onClick={() => onAddToSong(p.id)}
                className="px-3 py-1.5 rounded-xl text-[0.68rem] font-black uppercase tracking-wide
                           border border-[#333355] text-[#8888aa]
                           hover:border-[#ffee00] hover:text-[#ffee00]
                           transition-colors duration-150"
              >
                + {p.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
