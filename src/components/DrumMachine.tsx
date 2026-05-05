'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { INSTRUMENTS, STEPS } from '@/lib/instruments'
import { playSound } from '@/lib/sounds'
import { startSynthVoice } from '@/lib/synth'
import { DEFAULT_SYNTH_WAVE, type MelodyState, type SynthWaveform } from '@/lib/melody'
import { useAudio } from '@/hooks/useAudio'
import { useSequencer } from '@/hooks/useSequencer'
import { useAuth } from '@/hooks/useAuth'
import {
  loadPatterns,
  savePattern,
  deletePattern,
  loadSong,
  saveSong,
  exportBundle,
  importBundle,
  clearLocalPatterns,
  emptySeqState,
  emptyPatternMelody,
  type SavedPattern,
} from '@/lib/patternStore'
import {
  fetchPatterns,
  upsertPattern,
  removePattern,
  fetchSong,
  upsertSong,
} from '@/lib/supabaseStore'
import PadGrid from './PadGrid'
import Sequencer from './Sequencer'
import Transport from './Transport'
import PatternManager from './PatternManager'
import SongMode from './SongMode'
import AuthModal from './AuthModal'
import UserBar from './UserBar'
import PianoKeyboard from './PianoKeyboard'

export default function DrumMachine() {
  const { getCtx, ctxRef } = useAudio()
  const { user, loading: authLoading } = useAuth()

  // ── Auth UI ──────────────────────────────────────────────────────────────
  const [showAuthModal, setShowAuthModal]     = useState(false)
  const [syncing, setSyncing]                 = useState(false)
  const [localPatternCount, setLocalPatternCount] = useState(0)
  const userRef = useRef(user)
  useEffect(() => { userRef.current = user }, [user])

  // ── Sequencer state ──────────────────────────────────────────────────────
  const [seqState, setSeqState] = useState<boolean[][]>(
    () => INSTRUMENTS.map(() => new Array(STEPS).fill(false))
  )
  const seqStateRef = useRef<boolean[][]>(seqState)
  const [melodyState, setMelodyState] = useState<MelodyState>(() => emptyPatternMelody())
  const melodyStateRef = useRef<MelodyState>(melodyState)
  const [synthWave, setSynthWave] = useState<SynthWaveform>(DEFAULT_SYNTH_WAVE)
  const synthWaveRef = useRef<SynthWaveform>(synthWave)
  const [melodyRecording, setMelodyRecording] = useState(false)
  const [selectedMelodyStep, setSelectedMelodyStep] = useState(0)

  const setSynthWaveWithRef = useCallback((wave: SynthWaveform) => {
    synthWaveRef.current = wave
    setSynthWave(wave)
  }, [])

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
    const clearMelody = emptyPatternMelody()
    setSeqState(cleared)
    seqStateRef.current = cleared
    setMelodyState(clearMelody)
    melodyStateRef.current = clearMelody
    setSelectedMelodyStep(0)
  }, [])

  // ── Transport ────────────────────────────────────────────────────────────
  const [isPlaying, setIsPlaying]   = useState(false)
  const [bpm, setBpm]               = useState(120)
  const [activeStep, setActiveStep] = useState(-1)
  const activeStepRef = useRef(-1)

  const bpmRef = useRef(bpm)
  const setBpmWithRef = useCallback((val: number) => {
    bpmRef.current = val
    setBpm(val)
  }, [])

  const setActiveStepWithRef = useCallback((step: number) => {
    activeStepRef.current = step
    setActiveStep(step)
  }, [])

  // ── Pattern library ──────────────────────────────────────────────────────
  const [savedPatterns, setSavedPatterns]         = useState<SavedPattern[]>([])
  const [currentPatternId, setCurrentPatternId]   = useState<string | null>(null)
  const [currentPatternName, setCurrentPatternName] = useState('Pattern 1')
  const savedPatternsRef = useRef<SavedPattern[]>([])
  useEffect(() => { savedPatternsRef.current = savedPatterns }, [savedPatterns])

  // ── Song mode ────────────────────────────────────────────────────────────
  const [songMode, setSongMode]               = useState(false)
  const [songArrangement, setSongArrangement] = useState<string[]>([])
  const [currentSongIdx, setCurrentSongIdx]   = useState(0)
  const songModeRef        = useRef(false)
  const songArrangementRef = useRef<string[]>([])
  const currentSongIdxRef  = useRef(0)
  useEffect(() => { songModeRef.current = songMode },                [songMode])
  useEffect(() => { songArrangementRef.current = songArrangement }, [songArrangement])
  useEffect(() => { currentSongIdxRef.current = currentSongIdx },   [currentSongIdx])

  // ── Load data when auth state changes ────────────────────────────────────
  const refreshPatterns = useCallback(async () => {
    const u = userRef.current
    if (u) {
      const patterns = await fetchPatterns(u.id)
      setSavedPatterns(patterns)
      savedPatternsRef.current = patterns
    } else {
      const patterns = loadPatterns()
      setSavedPatterns(patterns)
      savedPatternsRef.current = patterns
    }
  }, [])

  useEffect(() => {
    if (authLoading) return

    async function loadData() {
      const u = user
      if (u) {
        try {
          const [patterns, song] = await Promise.all([fetchPatterns(u.id), fetchSong(u.id)])
          setSavedPatterns(patterns)
          savedPatternsRef.current = patterns
          setSongArrangement(song.patternIds)
          songArrangementRef.current = song.patternIds
          // Check for local patterns that haven't been migrated yet
          setLocalPatternCount(loadPatterns().length)
        } catch (err) {
          console.error('Failed to load from Supabase:', err)
        }
      } else {
        const patterns = loadPatterns()
        const song     = loadSong()
        setSavedPatterns(patterns)
        savedPatternsRef.current = patterns
        setSongArrangement(song.patternIds)
        songArrangementRef.current = song.patternIds
        setLocalPatternCount(0)
      }
    }

    loadData()
  }, [user, authLoading])

  // ── Migrate local patterns to Supabase ───────────────────────────────────
  const handleImportLocal = useCallback(async () => {
    const u = userRef.current
    if (!u) return
    const local = loadPatterns()
    if (local.length === 0) return
    setSyncing(true)
    try {
      await Promise.all(local.map(p => upsertPattern(u.id, p)))
      clearLocalPatterns()
      setLocalPatternCount(0)
      await refreshPatterns()
    } catch (err) {
      console.error('Failed to import local patterns:', err)
    } finally {
      setSyncing(false)
    }
  }, [refreshPatterns])

  // ── Save song arrangement (localStorage + cloud) ─────────────────────────
  const persistSong = useCallback((patternIds: string[]) => {
    saveSong({ patternIds })
    songArrangementRef.current = patternIds
    const u = userRef.current
    if (u) upsertSong(u.id, { patternIds }).catch(console.error)
  }, [])

  // ── Pattern CRUD ─────────────────────────────────────────────────────────
  const handleSavePattern = useCallback(async () => {
    if (!currentPatternId) return
    const pattern: SavedPattern = {
      id: currentPatternId,
      name: currentPatternName,
      bpm,
      seqState,
      melodyState,
      synthWave,
    }
    const u = userRef.current
    if (u) {
      setSyncing(true)
      try { await upsertPattern(u.id, pattern) }
      catch (err) { console.error('Failed to save pattern:', err) }
      finally { setSyncing(false) }
    } else {
      savePattern(pattern)
    }
    await refreshPatterns()
  }, [currentPatternId, currentPatternName, bpm, seqState, melodyState, synthWave, refreshPatterns])

  const handleSaveAs = useCallback(async (name: string) => {
    const id = crypto.randomUUID()
    const pattern: SavedPattern = { id, name, bpm, seqState, melodyState, synthWave }
    const u = userRef.current
    if (u) {
      setSyncing(true)
      try { await upsertPattern(u.id, pattern) }
      catch (err) { console.error('Failed to save pattern:', err) }
      finally { setSyncing(false) }
    } else {
      savePattern(pattern)
    }
    setCurrentPatternId(id)
    setCurrentPatternName(name)
    await refreshPatterns()
  }, [bpm, seqState, melodyState, synthWave, refreshPatterns])

  const handleLoadPattern = useCallback((pattern: SavedPattern) => {
    setSeqState(pattern.seqState)
    seqStateRef.current = pattern.seqState
    setMelodyState(pattern.melodyState)
    melodyStateRef.current = pattern.melodyState
    setSynthWaveWithRef(pattern.synthWave)
    setBpmWithRef(pattern.bpm)
    setCurrentPatternName(pattern.name)
    setCurrentPatternId(pattern.id)
  }, [setBpmWithRef, setSynthWaveWithRef])

  const handleDeletePattern = useCallback(async (id: string) => {
    const u = userRef.current
    if (u) {
      setSyncing(true)
      try { await removePattern(id) }
      catch (err) { console.error('Failed to delete pattern:', err) }
      finally { setSyncing(false) }
    } else {
      deletePattern(id)
    }
    await refreshPatterns()
    setSongArrangement(prev => {
      const next = prev.filter(pid => pid !== id)
      persistSong(next)
      return next
    })
    if (currentPatternId === id) setCurrentPatternId(null)
  }, [currentPatternId, refreshPatterns, persistSong])

  // ── Export / Import ──────────────────────────────────────────────────────
  const handleExport = useCallback(() => {
    exportBundle(savedPatternsRef.current, { patternIds: songArrangementRef.current })
  }, [])

  const handleImport = useCallback(async (json: string) => {
    const bundle = importBundle(json)
    if (!bundle) { alert('Invalid file — could not import.'); return }

    const u = userRef.current
    if (u) {
      setSyncing(true)
      try {
        await Promise.all(bundle.patterns.map(p => upsertPattern(u.id, p)))
        const current = await fetchSong(u.id)
        const merged  = [...new Set([...current.patternIds, ...bundle.song.patternIds])]
        await upsertSong(u.id, { patternIds: merged })
        setSongArrangement(merged)
        songArrangementRef.current = merged
      } catch (err) {
        console.error('Failed to import:', err)
      } finally {
        setSyncing(false)
      }
    } else {
      bundle.patterns.forEach(p => savePattern(p))
      setSongArrangement(prev => {
        const merged = [...new Set([...prev, ...bundle.song.patternIds])]
        persistSong(merged)
        return merged
      })
    }
    await refreshPatterns()
  }, [refreshPatterns, persistSong])

  // ── Song arrangement ─────────────────────────────────────────────────────
  const handleAddToSong = useCallback((patternId: string) => {
    setSongArrangement(prev => {
      const next = [...prev, patternId]
      persistSong(next)
      return next
    })
  }, [persistSong])

  const handleRemoveFromSong = useCallback((index: number) => {
    setSongArrangement(prev => {
      const next = prev.filter((_, i) => i !== index)
      persistSong(next)
      return next
    })
  }, [persistSong])

  const handleMoveUp = useCallback((index: number) => {
    if (index === 0) return
    setSongArrangement(prev => {
      const next = [...prev]
      ;[next[index - 1], next[index]] = [next[index], next[index - 1]]
      persistSong(next)
      return next
    })
  }, [persistSong])

  const handleMoveDown = useCallback((index: number) => {
    setSongArrangement(prev => {
      if (index >= prev.length - 1) return prev
      const next = [...prev]
      ;[next[index], next[index + 1]] = [next[index + 1], next[index]]
      persistSong(next)
      return next
    })
  }, [persistSong])

  const handleClearSong = useCallback(() => {
    setSongArrangement([])
    persistSong([])
  }, [persistSong])

  // ── Song mode loop-end: advance to next pattern ──────────────────────────
  const handleLoopEnd = useCallback(() => {
    if (!songModeRef.current) return
    const arr = songArrangementRef.current
    if (arr.length === 0) return

    const nextIdx = (currentSongIdxRef.current + 1) % arr.length
    const pattern = savedPatternsRef.current.find(p => p.id === arr[nextIdx])
    if (!pattern) return

    seqStateRef.current = pattern.seqState
    melodyStateRef.current = pattern.melodyState
    synthWaveRef.current   = pattern.synthWave
    bpmRef.current      = pattern.bpm
    currentSongIdxRef.current = nextIdx

    setSeqState(pattern.seqState)
    setMelodyState(pattern.melodyState)
    setSynthWave(pattern.synthWave)
    setBpm(pattern.bpm)
    setCurrentSongIdx(nextIdx)
    setCurrentPatternId(pattern.id)
    setCurrentPatternName(pattern.name)
  }, [])

  // ── Play / Stop ──────────────────────────────────────────────────────────
  const handlePlayStop = useCallback(() => {
    if (!isPlaying) {
      getCtx()
      if (songModeRef.current && songArrangementRef.current.length > 0) {
        const firstId      = songArrangementRef.current[0]
        const firstPattern = savedPatternsRef.current.find(p => p.id === firstId)
        if (firstPattern) {
          seqStateRef.current       = firstPattern.seqState
          melodyStateRef.current    = firstPattern.melodyState
          synthWaveRef.current      = firstPattern.synthWave
          bpmRef.current            = firstPattern.bpm
          currentSongIdxRef.current = 0
          setSeqState(firstPattern.seqState)
          setMelodyState(firstPattern.melodyState)
          setSynthWave(firstPattern.synthWave)
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
    melodyStateRef,
    synthWaveRef,
    bpmRef,
    instruments: INSTRUMENTS,
    isPlaying,
    onStepChange: setActiveStepWithRef,
    onLoopEnd: handleLoopEnd,
  })

  // ── Pad hit ──────────────────────────────────────────────────────────────
  const handlePadPlay = useCallback((instIdx: number) => {
    const ctx = getCtx()
    playSound(INSTRUMENTS[instIdx].id, ctx, ctx.currentTime)
  }, [getCtx])

  const recordMelodyNote = useCallback((note: string) => {
    const step = isPlaying && activeStepRef.current >= 0 ? activeStepRef.current : selectedMelodyStep

    setMelodyState(prev => {
      const next = [...prev]
      next[step] = note
      melodyStateRef.current = next
      return next
    })

    if (!isPlaying) {
      setSelectedMelodyStep((step + 1) % STEPS)
    }
  }, [isPlaying, selectedMelodyStep])

  const handleSynthNoteStart = useCallback((note: string) => {
    const ctx = getCtx()
    const voice = startSynthVoice(note, synthWaveRef.current, ctx)

    if (melodyRecording) {
      recordMelodyNote(note)
    }

    return () => voice.stop()
  }, [getCtx, melodyRecording, recordMelodyNote])

  const handleMelodyStepClick = useCallback((step: number) => {
    const note = melodyStateRef.current[step]
    setSelectedMelodyStep(step)

    if (!note) return

    setMelodyState(prev => {
      const next = [...prev]
      next[step] = null
      melodyStateRef.current = next
      return next
    })
  }, [])

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="w-full max-w-3xl flex flex-col gap-6">
      {/* Auth modal */}
      {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}

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

      {/* User bar */}
      <UserBar
        user={user}
        syncing={syncing}
        localPatternCount={localPatternCount}
        onShowAuth={() => setShowAuthModal(true)}
        onImportLocal={handleImportLocal}
      />

      {/* Pad grid */}
      <PadGrid instruments={INSTRUMENTS} onPlay={handlePadPlay} />

      {/* Melody keyboard */}
      <PianoKeyboard
        wave={synthWave}
        recording={melodyRecording}
        activeStep={activeStep}
        selectedStep={selectedMelodyStep}
        melodyState={melodyState}
        onWaveChange={setSynthWaveWithRef}
        onRecordingChange={setMelodyRecording}
        onNoteStart={handleSynthNoteStart}
      />

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
          melodyState={melodyState}
          activeStep={activeStep}
          selectedMelodyStep={selectedMelodyStep}
          onToggle={handleToggle}
          onMelodyStepClick={handleMelodyStepClick}
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
