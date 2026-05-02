'use client'

import { useRef, useState } from 'react'
import type { SavedPattern } from '@/lib/patternStore'

interface PatternManagerProps {
  savedPatterns: SavedPattern[]
  currentPatternId: string | null
  currentPatternName: string
  onNameChange: (name: string) => void
  onSave: () => void
  onSaveAs: (name: string) => void
  onLoad: (pattern: SavedPattern) => void
  onDelete: (id: string) => void
  onExport: () => void
  onImport: (json: string) => void
}

export default function PatternManager({
  savedPatterns,
  currentPatternId,
  currentPatternName,
  onNameChange,
  onSave,
  onSaveAs,
  onLoad,
  onDelete,
  onExport,
  onImport,
}: PatternManagerProps) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [saveAsName, setSaveAsName] = useState('')
  const [showSaveAs, setShowSaveAs] = useState(false)

  function handleImportFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => {
      const text = ev.target?.result
      if (typeof text === 'string') onImport(text)
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  function handleSaveAs() {
    const name = saveAsName.trim()
    if (!name) return
    onSaveAs(name)
    setSaveAsName('')
    setShowSaveAs(false)
  }

  return (
    <div
      className="rounded-2xl border p-5 flex flex-col gap-4"
      style={{ background: '#0c0c1a', borderColor: '#1a1a3a' }}
    >
      {/* Header row */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <span
          className="text-[0.65rem] font-black uppercase tracking-[0.28em]"
          style={{ color: '#ff00ff' }}
        >
          Pattern Library
        </span>
        <div className="flex gap-2">
          <button
            onClick={onExport}
            className="px-3 py-1.5 rounded-lg text-[0.65rem] font-bold uppercase tracking-widest border
                       border-[#333355] text-[#555577] hover:border-[#00ffcc] hover:text-[#00ffcc]
                       transition-colors duration-150"
          >
            Export
          </button>
          <button
            onClick={() => fileRef.current?.click()}
            className="px-3 py-1.5 rounded-lg text-[0.65rem] font-bold uppercase tracking-widest border
                       border-[#333355] text-[#555577] hover:border-[#00aaff] hover:text-[#00aaff]
                       transition-colors duration-150"
          >
            Import
          </button>
          <input
            ref={fileRef}
            type="file"
            accept=".json"
            className="hidden"
            onChange={handleImportFile}
          />
        </div>
      </div>

      {/* Current pattern name + save controls */}
      <div className="flex items-center gap-2 flex-wrap">
        <input
          type="text"
          value={currentPatternName}
          onChange={e => onNameChange(e.target.value)}
          placeholder="Pattern name…"
          className="flex-1 min-w-[140px] px-3 py-2 rounded-lg text-sm font-bold
                     bg-[#0e0e22] border border-[#1e1e3a] text-white placeholder-[#2a2a4a]
                     focus:outline-none focus:border-[#ff00ff]"
        />
        {currentPatternId && (
          <button
            onClick={onSave}
            className="px-4 py-2 rounded-lg text-sm font-black uppercase tracking-widest text-black
                       transition-all duration-150 hover:scale-105 active:scale-95"
            style={{ background: 'linear-gradient(135deg, #ff00ff, #aa00ff)' }}
          >
            Update
          </button>
        )}
        <button
          onClick={() => setShowSaveAs(v => !v)}
          className="px-4 py-2 rounded-lg text-sm font-black uppercase tracking-widest text-black
                     transition-all duration-150 hover:scale-105 active:scale-95"
          style={{ background: 'linear-gradient(135deg, #00ffcc, #00aaff)' }}
        >
          Save As
        </button>
      </div>

      {/* Save-as name row */}
      {showSaveAs && (
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={saveAsName}
            onChange={e => setSaveAsName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSaveAs()}
            placeholder="New pattern name…"
            autoFocus
            className="flex-1 px-3 py-2 rounded-lg text-sm font-bold
                       bg-[#0e0e22] border border-[#1e1e3a] text-white placeholder-[#2a2a4a]
                       focus:outline-none focus:border-[#00ffcc]"
          />
          <button
            onClick={handleSaveAs}
            disabled={!saveAsName.trim()}
            className="px-4 py-2 rounded-lg text-sm font-black uppercase tracking-widest text-black
                       disabled:opacity-40 transition-all duration-150 hover:scale-105 active:scale-95"
            style={{ background: 'linear-gradient(135deg, #00ffcc, #00aaff)' }}
          >
            Save
          </button>
          <button
            onClick={() => setShowSaveAs(false)}
            className="px-3 py-2 rounded-lg text-sm font-bold border border-[#333355]
                       text-[#555577] hover:text-white hover:border-white transition-colors"
          >
            ✕
          </button>
        </div>
      )}

      {/* Saved pattern list */}
      {savedPatterns.length === 0 ? (
        <p className="text-[0.65rem] text-[#2a2a4a] uppercase tracking-widest">
          No saved patterns yet
        </p>
      ) : (
        <div className="flex flex-col gap-1.5 max-h-48 overflow-y-auto pr-1">
          {savedPatterns.map(p => {
            const isActive = p.id === currentPatternId
            return (
              <div
                key={p.id}
                className="flex items-center gap-2 px-3 py-2 rounded-xl"
                style={{
                  background: isActive ? '#1a1a3a' : '#0e0e22',
                  border: `1px solid ${isActive ? '#ff00ff44' : '#1e1e3a'}`,
                }}
              >
                <span
                  className="flex-1 text-sm font-bold truncate"
                  style={{ color: isActive ? '#ff00ff' : '#8888aa' }}
                >
                  {p.name}
                </span>
                <span className="text-[0.6rem] font-bold tabular-nums" style={{ color: '#2a2a4a' }}>
                  {p.bpm} BPM
                </span>
                <button
                  onClick={() => onLoad(p)}
                  className="px-2.5 py-1 rounded-md text-[0.65rem] font-black uppercase tracking-wide
                             transition-colors duration-150"
                  style={{
                    color: isActive ? '#ff00ff' : '#555577',
                    border: `1px solid ${isActive ? '#ff00ff44' : '#333355'}`,
                  }}
                >
                  Load
                </button>
                <button
                  onClick={() => onDelete(p.id)}
                  className="px-2.5 py-1 rounded-md text-[0.65rem] font-black uppercase tracking-wide
                             border border-[#333355] text-[#555577]
                             hover:border-[#ff2244] hover:text-[#ff2244]
                             transition-colors duration-150"
                >
                  Del
                </button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
