// All sounds are synthesized with the Web Audio API — no audio files needed.

/** Create a mono white-noise buffer source of the given duration (seconds). */
function noiseSource(ctx: AudioContext, duration: number): AudioBufferSourceNode {
  const len = Math.ceil(ctx.sampleRate * duration)
  const buf = ctx.createBuffer(1, len, ctx.sampleRate)
  const data = buf.getChannelData(0)
  for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1
  const src = ctx.createBufferSource()
  src.buffer = buf
  return src
}

/** Apply a simple exponential decay envelope to a GainNode. */
function applyEnv(g: GainNode, peak: number, decay: number, t: number): void {
  g.gain.setValueAtTime(peak, t)
  g.gain.exponentialRampToValueAtTime(0.0001, t + decay)
}

export function playSound(id: string, ctx: AudioContext, t: number): void {
  const out = ctx.destination

  switch (id) {
    /* ── Kick ─────────────────────────────────────────────────────────── */
    case 'kick': {
      const osc = ctx.createOscillator()
      const g = ctx.createGain()
      osc.frequency.setValueAtTime(160, t)
      osc.frequency.exponentialRampToValueAtTime(0.001, t + 0.55)
      applyEnv(g, 1, 0.55, t)
      osc.connect(g); g.connect(out)
      osc.start(t); osc.stop(t + 0.55)
      break
    }

    /* ── Snare ────────────────────────────────────────────────────────── */
    case 'snare': {
      // tonal body
      const osc = ctx.createOscillator()
      const og = ctx.createGain()
      osc.frequency.value = 185
      applyEnv(og, 0.55, 0.12, t)
      osc.connect(og); og.connect(out)
      osc.start(t); osc.stop(t + 0.12)
      // noise crack
      const n = noiseSource(ctx, 0.22)
      const nf = ctx.createBiquadFilter()
      nf.type = 'highpass'; nf.frequency.value = 900
      const ng = ctx.createGain()
      applyEnv(ng, 0.72, 0.22, t)
      n.connect(nf); nf.connect(ng); ng.connect(out)
      n.start(t); n.stop(t + 0.22)
      break
    }

    /* ── Closed Hi-Hat ────────────────────────────────────────────────── */
    case 'hihat': {
      const n = noiseSource(ctx, 0.09)
      const f = ctx.createBiquadFilter()
      f.type = 'bandpass'; f.frequency.value = 12000; f.Q.value = 0.6
      const g = ctx.createGain()
      applyEnv(g, 0.55, 0.09, t)
      n.connect(f); f.connect(g); g.connect(out)
      n.start(t); n.stop(t + 0.09)
      break
    }

    /* ── Open Hi-Hat ──────────────────────────────────────────────────── */
    case 'openhat': {
      const n = noiseSource(ctx, 0.5)
      const f = ctx.createBiquadFilter()
      f.type = 'bandpass'; f.frequency.value = 10000; f.Q.value = 0.5
      const g = ctx.createGain()
      applyEnv(g, 0.45, 0.5, t)
      n.connect(f); f.connect(g); g.connect(out)
      n.start(t); n.stop(t + 0.5)
      break
    }

    /* ── Clap ─────────────────────────────────────────────────────────── */
    case 'clap': {
      // Three overlapping noise bursts to create the "clap" transient texture
      for (const off of [0, 0.012, 0.024]) {
        const n = noiseSource(ctx, 0.18)
        const f = ctx.createBiquadFilter()
        f.type = 'bandpass'; f.frequency.value = 1100; f.Q.value = 0.8
        const g = ctx.createGain()
        g.gain.setValueAtTime(0.7, t + off)
        g.gain.exponentialRampToValueAtTime(0.0001, t + off + 0.18)
        n.connect(f); f.connect(g); g.connect(out)
        n.start(t + off); n.stop(t + off + 0.18)
      }
      break
    }

    /* ── Rim Shot ─────────────────────────────────────────────────────── */
    case 'rim': {
      const osc = ctx.createOscillator()
      const g = ctx.createGain()
      osc.type = 'square'
      osc.frequency.value = 1600
      applyEnv(g, 0.42, 0.045, t)
      osc.connect(g); g.connect(out)
      osc.start(t); osc.stop(t + 0.045)
      break
    }

    /* ── Low Tom ──────────────────────────────────────────────────────── */
    case 'lowtom': {
      const osc = ctx.createOscillator()
      const g = ctx.createGain()
      osc.frequency.setValueAtTime(100, t)
      osc.frequency.exponentialRampToValueAtTime(40, t + 0.35)
      applyEnv(g, 0.85, 0.35, t)
      osc.connect(g); g.connect(out)
      osc.start(t); osc.stop(t + 0.35)
      break
    }

    /* ── Mid Tom ──────────────────────────────────────────────────────── */
    case 'midtom': {
      const osc = ctx.createOscillator()
      const g = ctx.createGain()
      osc.frequency.setValueAtTime(200, t)
      osc.frequency.exponentialRampToValueAtTime(70, t + 0.28)
      applyEnv(g, 0.8, 0.28, t)
      osc.connect(g); g.connect(out)
      osc.start(t); osc.stop(t + 0.28)
      break
    }

    /* ── Hi Tom ───────────────────────────────────────────────────────── */
    case 'hitom': {
      const osc = ctx.createOscillator()
      const g = ctx.createGain()
      osc.frequency.setValueAtTime(350, t)
      osc.frequency.exponentialRampToValueAtTime(120, t + 0.22)
      applyEnv(g, 0.8, 0.22, t)
      osc.connect(g); g.connect(out)
      osc.start(t); osc.stop(t + 0.22)
      break
    }

    /* ── Cowbell (TR-808-style) ───────────────────────────────────────── */
    case 'cowbell': {
      for (const freq of [562, 845]) {
        const osc = ctx.createOscillator()
        const g = ctx.createGain()
        osc.type = 'square'
        osc.frequency.value = freq
        applyEnv(g, 0.32, 0.7, t)
        osc.connect(g); g.connect(out)
        osc.start(t); osc.stop(t + 0.7)
      }
      break
    }

    /* ── Cymbal (inharmonic partials) ────────────────────────────────── */
    case 'cymbal': {
      // Irrational frequency ratios give a metallic, non-pitched quality
      for (const r of [1, 1.342, 1.781, 2.019, 2.537, 3.184]) {
        const osc = ctx.createOscillator()
        const g = ctx.createGain()
        osc.type = 'square'
        osc.frequency.value = 380 * r
        applyEnv(g, 0.11, 0.9, t)
        osc.connect(g); g.connect(out)
        osc.start(t); osc.stop(t + 0.9)
      }
      break
    }

    /* ── Shaker ───────────────────────────────────────────────────────── */
    case 'shaker': {
      const n = noiseSource(ctx, 0.07)
      const f = ctx.createBiquadFilter()
      f.type = 'highpass'; f.frequency.value = 7500
      const g = ctx.createGain()
      applyEnv(g, 0.38, 0.07, t)
      n.connect(f); f.connect(g); g.connect(out)
      n.start(t); n.stop(t + 0.07)
      break
    }

    /* ── Sub Bass ─────────────────────────────────────────────────────── */
    case 'subbass': {
      const osc = ctx.createOscillator()
      const g = ctx.createGain()
      osc.frequency.setValueAtTime(55, t)
      osc.frequency.exponentialRampToValueAtTime(28, t + 0.65)
      applyEnv(g, 1, 0.65, t)
      osc.connect(g); g.connect(out)
      osc.start(t); osc.stop(t + 0.65)
      break
    }

    /* ── Bass Synth ───────────────────────────────────────────────────── */
    case 'bass': {
      const osc = ctx.createOscillator()
      const f = ctx.createBiquadFilter()
      const g = ctx.createGain()
      osc.type = 'sawtooth'
      osc.frequency.value = 90
      f.type = 'lowpass'; f.frequency.value = 600
      applyEnv(g, 0.8, 0.4, t)
      osc.connect(f); f.connect(g); g.connect(out)
      osc.start(t); osc.stop(t + 0.4)
      break
    }

    /* ── Lead Synth ───────────────────────────────────────────────────── */
    case 'synth': {
      const osc = ctx.createOscillator()
      const f = ctx.createBiquadFilter()
      const g = ctx.createGain()
      osc.type = 'sawtooth'
      osc.frequency.value = 440
      f.type = 'lowpass'; f.frequency.value = 2200
      applyEnv(g, 0.55, 0.3, t)
      osc.connect(f); f.connect(g); g.connect(out)
      osc.start(t); osc.stop(t + 0.3)
      break
    }

    /* ── Noise Burst ──────────────────────────────────────────────────── */
    case 'noise': {
      const n = noiseSource(ctx, 0.22)
      const g = ctx.createGain()
      applyEnv(g, 0.5, 0.22, t)
      n.connect(g); g.connect(out)
      n.start(t); n.stop(t + 0.22)
      break
    }
  }
}
