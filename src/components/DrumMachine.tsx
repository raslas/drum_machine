'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { INSTRUMENTS, STEPS } from '@/lib/instruments'
import { playSound } from '@/lib/sounds'
import { useAudio } from '@/hooks/useAudio'
import { useSequencer } from '@/hooks/useSequencer'
import {
  loadPatterns,
  savePattern,
  deletePattern,
  loadSong,
  saveSong,
  exportBundle,
  importBundle,
  emptySeqState,
  type SavedPattern,
} from '@/lib/patternStore'
import PadGrid from './PadGrid'
import Sequencer from './Sequencer'
import Transport from './Transport'
import PatternManager from './PatternManager'
import SongMode from './SongMode'

export default function DrumMachine() {
  const { getCtx, ctxRef } = useAudio()

  // ── Sequencer state ──────────────────────────────────────────────────────
  const [seqState, setSeqState] = useState<boolean[][]>(
    () => INSTRUMENTS.map(() => new Array(STEPS).fill(false))
  )
  const seqStateRef = useRef<boolean[][]>(seqState)

  const handleToggle = useCallback((instIdx: number, step: number) => {
    setSeqState(prev => {
      const next = prev.map(row => [...row])
      next[instIdx][step] = !next[instIdx][step]
      seqStateRef.current = next
      return next
    })
  }, [])

  const handleClear = useCallback(() => {
    const cleared = emptySeqState()
    setSeqState(cleared)
    seqStateRef.current = cleared
  }, [])

  // ── Transport ────────────────────────────────────────────────────────────
  const [isPlaying, setIsPlaying] = useState(false)
  const [bpm, setBpm] = useState(120)
  const [activeStep, setActiveStep] = useState(-1)

  // bpmRef lives here so song mode can update it immediately without waiting for re-render
  const bpmRef = useRef(bpm)
  const setBpmWithRef = useCallback((val: number) => {
    bpmRef.current = val
    setBpm(val)
  }, [])

  // ── Pattern library ──────────────────────────────────────────────────────
  const [savedPatterns, setSavedPatterns] = useState<SavedPattern[]>([])
  const [currentPatternId, setCurrentPatternId] = useState<string | null>(null)
  const [currentPatternName, setCurrentPatternName] = useState('Pattern 1')

  // Refs for use inside scheduler callbacks (avoid stale closures)
  const savedPatternsRef = useRef<SavedPattern[]>([])

  useEffect(() => {
    const patterns = loadPatterns()
    const song = loadSong()
    setSavedPatterns(patterns)
    savedPatternsRef.current = patterns
    setSongArrangement(song.patternIds)
    songArrangementRef.current = song.patternIds
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => { savedPatternsRef.current = savedPatterns }, [savedPatterns])

  const refreshPatterns = useCallback(() => {
    const patterns = loadPatterns()
    setSavedPatterns(patterns)
    savedPatternsRef.current = patterns
  }, [])

  const handleSavePattern = useCallback(() => {
    if (!currentPatternId) return
    const pattern: SavedPattern = {
      id: currentPatternId,
      name: currentPatternName,
      bpm,
      seqState,
    }
    savePattern(pattern)
    refreshPatterns()
  }, [currentPatternId, currentPatternName, bpm, seqState, refreshPatterns])

  const handleSaveAs = useCallback((name: string) => {
    const id = crypto.randomUUID()
    const pattern: SavedPattern = { id, name, bpm, seqState }
    savePattern(pattern)
    setCurrentPatternId(id)
    setCurrentPatternName(name)
    refreshPatterns()
  }, [bpm, seqState, refreshPatterns])

  const handleLoadPattern = useCallback((pattern: SavedPattern) => {
    setSeqState(pattern.seqState)
    seqStateRef.current = pattern.seqState
    setBpmWithRef(pattern.bpm)
    setCurrentPatternName(pattern.name)
    setCurrentPatternId(pattern.id)
  }, [setBpmWithRef])

  const handleDeletePattern = useCallback((id: string) => {
    deletePattern(id)
    refreshPatterns()
    // Remove from song arrangement
    setSongArrangement(prev => {
      const next = prev.filter(pid => pid !== id)
      saveSong({ patternIds: next })
      songArrangementRef.current = next
      return next
    })
    if (currentPatternId === id) setCurrentPatternId(null)
  }, [currentPatternId, refreshPatterns])

  // ── Export / Import ──────────────────────────────────────────────────────
  const handleExport = useCallback(() => {
    exportBundle(savedPatternsRef.current, { patternIds: songArrangementRef.current })
  }, [])

  const handleImport = useCallback((json: string) => {
    const bundle = importBundle(json)
    if (!bundle) {
      alert('Invalid file — could not import.')
      return
    }
    bundle.patterns.forEach(p => savePattern(p))
    refreshPatterns()
    setSongArrangement(prev => {
      const merged = [...new Set([...prev, ...bundle.song.patternIds])]
      saveSong({ patternIds: merged })
      songArrangementRef.current = merged
      return merged
    })
  }, [refreshPatterns])

  // ── Song mode ────────────────────────────────────────────────────────────
  const [songMode, setSongMode] = useState(false)
  const [songArrangement, setSongArrangement] = useState<string[]>([])
  const [currentSongIdx, setCurrentSongIdx] = useState(0)

  const songModeRef         = useRef(false)
  const songArrangementRef  = useRef<string[]>([])
  const currentSongIdxRef   = useRef(0)

  useEffect(() => { songModeRef.current = songMode },           [songMode])
  useEffect(() => { songArrangementRef.current = songArrangement }, [songArrangement])
  useEffect(() => { currentSongIdxRef.current = currentSongIdx }, [currentSongIdx])

  const handleAddToSong = useCallback((patternId: string) => {
    setSongArrangement(prev => {
      const next = [...prev, patternId]
      saveSong({ patternIds: next })
      songArrangementRef.current = next
      return next
    })
  }, [])

  const handleRemoveFromSong = useCallback((index: number) => {
    setSongArrangement(prev => {
      const next = prev.filter((_, i) => i !== index)
      saveSong({ patternIds: next })
      songArrangementRef.current = next
      return next
    })
  }, [])

  const handleMoveUp = useCallback((index: number) => {
    if (index === 0) return
    setSongArrangement(prev => {
      const next = [...prev]
      ;[next[index - 1], next[index]] = [next[index], next[index - 1]]
      saveSong({ patternIds: next })
      songArrangementRef.current = next
      return next
    })
  }, [])

  const handleMoveDown = useCallback((index: number) => {
    setSongArrangement(prev => {
      if (index >= prev.length - 1) return prev
      const next = [...prev]
      ;[next[index], next[index + 1]] = [next[index + 1], next[index]]
      saveSong({ patternIds: next })
      songArrangementRef.current = next
      return next
    })
  }, [])

  const handleClearSong = useCallback(() => {
    setSongArrangement([])
    songArrangementRef.current = []
    saveSong({ patternIds: [] })
  }, [])

  // Called by sequencer at the end of each 8-step loop
  const handleLoopEnd = useCallback(() => {
    if (!songModeRef.current) return
    const arr = songArrangementRef.current
    if (arr.length === 0) return

    const nextIdx = (currentSongIdxRef.current + 1) % arr.length
    const nextId  = arr[nextIdx]
    const pattern = savedPatternsRef.current.find(p => p.id === nextId)
    if (!pattern) return

    // Update refs immediately (synchronous) so sequencer reads new state on next tick
    seqStateRef.current = pattern.seqState
    bpmRef.current = pattern.bpm
    currentSongIdxRef.current = nextIdx

    // Schedule React state updates (async — for visual update only)
    setSeqState(pattern.seqState)
    setBpm(pattern.bpm)
    setCurrentSongIdx(nextIdx)
    setCurrentPatternId(pattern.id)
    setCurrentPatternName(pattern.name)
  }, [])

  // ── Play / Stop ──────────────────────────────────────────────────────────
  const handlePlayStop = useCallback(() => {
    if (!isPlaying) {
      getCtx()
      // In song mode, load the first arrangement pattern before starting
      if (songModeRef.current && songArrangementRef.current.length > 0) {
        const firstId      = songArrangementRef.current[0]
        const firstPattern = savedPatternsRef.current.find(p => p.id === firstId)
        if (firstPattern) {
          seqStateRef.current = firstPattern.seqState
          bpmRef.current = firstPattern.bpm
          currentSongIdxRef.current = 0
          setSeqState(firstPattern.seqState)
          setBpm(firstPattern.bpm)
          setCurrentSongIdx(0)
          setCurrentPatternId(firstPattern.id)
          setCurrentPatternName(firstPattern.name)
        }
      }
    }
    setIsPlaying(prev => !prev)
  }, [isPlaying, getCtx])

  // ── Sequencer clock ──────────────────────────────────────────────────────
  useSequencer({
    ctxRef,
    seqStateRef,
    bpmRef,
    instruments: INSTRUMENTS,
    isPlaying,
    onStepChange: setActiveStep,
    onLoopEnd: handleLoopEnd,
  })

  // ── Pad hit ──────────────────────────────────────────────────────────────
  const handlePadPlay = useCallback((instIdx: number) => {
    const ctx = getCtx()
    playSound(INSTRUMENTS[instIdx].id, ctx, ctx.currentTime)
  }, [getCtx])

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="w-full max-w-3xl flex flex-col gap-6">
      {/* Header */}
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

      {/* Pad grid */}
      <PadGrid instruments={INSTRUMENTS} onPlay={handlePadPlay} />

      {/* Sequencer card */}
      <section
        className="rounded-2xl border p-5"
        style={{ background: '#0c0c1a', borderColor: '#1a1a3a' }}
      >
        <Transport
          isPlaying={isPlaying}
          bpm={bpm}
          songMode={songMode}
          currentPatternName={currentPatternName}
          onPlayStop={handlePlayStop}
          onBpmChange={setBpmWithRef}
          onClear={handleClear}
        />
        <Sequencer
          instruments={INSTRUMENTS}
          seqState={seqState}
          activeStep={activeStep}
          onToggle={handleToggle}
        />
      </section>

      {/* Pattern library */}
      <PatternManager
        savedPatterns={savedPatterns}
        currentPatternId={currentPatternId}
        currentPatternName={currentPatternName}
        onNameChange={setCurrentPatternName}
        onSave={handleSavePattern}
        onSaveAs={handleSaveAs}
        onLoad={handleLoadPattern}
        onDelete={handleDeletePattern}
        onExport={handleExport}
        onImport={handleImport}
      />

      {/* Song mode */}
      <SongMode
        savedPatterns={savedPatterns}
        songArrangement={songArrangement}
        currentSongIdx={currentSongIdx}
        isPlaying={isPlaying}
        songMode={songMode}
        onToggleSongMode={() => setSongMode(v => !v)}
        onAddToSong={handleAddToSong}
        onRemoveFromSong={handleRemoveFromSong}
        onMoveUp={handleMoveUp}
        onMoveDown={handleMoveDown}
        onClearSong={handleClearSong}
      />
    </div>
  )
}
