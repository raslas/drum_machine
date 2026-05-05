import { noteToFrequency, type SynthWaveform } from './melody'

interface SynthVoice {
  stop: (t?: number) => void
}

function setEnvelope(gain: AudioParam, peak: number, t: number, duration: number): void {
  const attack = 0.012
  const decay = Math.min(0.16, duration * 0.45)
  const sustain = peak * 0.46

  gain.cancelScheduledValues(t)
  gain.setValueAtTime(0.0001, t)
  gain.linearRampToValueAtTime(peak, t + attack)
  gain.exponentialRampToValueAtTime(Math.max(0.0001, sustain), t + attack + decay)
  gain.setValueAtTime(Math.max(0.0001, sustain), t + Math.max(duration - 0.05, attack + decay))
  gain.exponentialRampToValueAtTime(0.0001, t + duration)
}

function shapeForWave(wave: SynthWaveform) {
  switch (wave) {
    case 'sine':
      return { peak: 0.44, cutoff: 3200, q: 0.5, detune: 3, subGain: 0.16 }
    case 'square':
      return { peak: 0.28, cutoff: 1500, q: 3.2, detune: 5, subGain: 0.08 }
    case 'sawtooth':
    default:
      return { peak: 0.3, cutoff: 2200, q: 2.1, detune: 7, subGain: 0.11 }
  }
}

export function startSynthVoice(
  note: string,
  wave: SynthWaveform,
  ctx: AudioContext,
  t = ctx.currentTime
): SynthVoice {
  const freq = noteToFrequency(note)
  const tone = shapeForWave(wave)

  const main = ctx.createOscillator()
  const wide = ctx.createOscillator()
  const sub = ctx.createOscillator()
  const filter = ctx.createBiquadFilter()
  const voiceGain = ctx.createGain()
  const subGain = ctx.createGain()
  const output = ctx.createGain()
  const pan = ctx.createStereoPanner()

  main.type = wave
  wide.type = wave === 'sine' ? 'triangle' : wave
  sub.type = 'sine'

  main.frequency.setValueAtTime(freq, t)
  wide.frequency.setValueAtTime(freq, t)
  sub.frequency.setValueAtTime(freq / 2, t)
  main.detune.setValueAtTime(-tone.detune, t)
  wide.detune.setValueAtTime(tone.detune, t)

  filter.type = 'lowpass'
  filter.frequency.setValueAtTime(tone.cutoff * 1.55, t)
  filter.frequency.exponentialRampToValueAtTime(tone.cutoff, t + 0.18)
  filter.Q.setValueAtTime(tone.q, t)

  voiceGain.gain.setValueAtTime(0.0001, t)
  voiceGain.gain.linearRampToValueAtTime(tone.peak, t + 0.018)
  voiceGain.gain.exponentialRampToValueAtTime(tone.peak * 0.58, t + 0.22)
  subGain.gain.setValueAtTime(tone.subGain, t)
  output.gain.setValueAtTime(0.72, t)
  pan.pan.setValueAtTime((Math.random() - 0.5) * 0.12, t)

  main.connect(filter)
  wide.connect(filter)
  filter.connect(voiceGain)
  sub.connect(subGain)
  voiceGain.connect(output)
  subGain.connect(output)
  output.connect(pan)
  pan.connect(ctx.destination)

  main.start(t)
  wide.start(t)
  sub.start(t)

  let stopped = false
  const stop = (stopTime = ctx.currentTime) => {
    if (stopped) return
    stopped = true

    voiceGain.gain.cancelScheduledValues(stopTime)
    voiceGain.gain.setTargetAtTime(0.0001, stopTime, 0.055)
    subGain.gain.cancelScheduledValues(stopTime)
    subGain.gain.setTargetAtTime(0.0001, stopTime, 0.055)
    output.gain.cancelScheduledValues(stopTime)
    output.gain.setTargetAtTime(0.0001, stopTime, 0.07)

    const end = stopTime + 0.28
    main.stop(end)
    wide.stop(end)
    sub.stop(end)
  }

  return { stop }
}

export function playSynthNote(
  note: string,
  wave: SynthWaveform,
  ctx: AudioContext,
  t: number,
  duration: number
): void {
  const freq = noteToFrequency(note)
  const tone = shapeForWave(wave)

  const main = ctx.createOscillator()
  const wide = ctx.createOscillator()
  const sub = ctx.createOscillator()
  const filter = ctx.createBiquadFilter()
  const voiceGain = ctx.createGain()
  const subGain = ctx.createGain()
  const output = ctx.createGain()

  main.type = wave
  wide.type = wave === 'sine' ? 'triangle' : wave
  sub.type = 'sine'

  main.frequency.setValueAtTime(freq, t)
  wide.frequency.setValueAtTime(freq, t)
  sub.frequency.setValueAtTime(freq / 2, t)
  main.detune.setValueAtTime(-tone.detune, t)
  wide.detune.setValueAtTime(tone.detune, t)

  filter.type = 'lowpass'
  filter.frequency.setValueAtTime(tone.cutoff * 1.7, t)
  filter.frequency.exponentialRampToValueAtTime(tone.cutoff * 0.8, t + Math.min(0.2, duration))
  filter.Q.setValueAtTime(tone.q, t)

  setEnvelope(voiceGain.gain, tone.peak, t, duration)
  setEnvelope(subGain.gain, tone.subGain, t, duration)
  output.gain.setValueAtTime(0.68, t)

  main.connect(filter)
  wide.connect(filter)
  filter.connect(voiceGain)
  sub.connect(subGain)
  voiceGain.connect(output)
  subGain.connect(output)
  output.connect(ctx.destination)

  main.start(t)
  wide.start(t)
  sub.start(t)
  main.stop(t + duration + 0.03)
  wide.stop(t + duration + 0.03)
  sub.stop(t + duration + 0.03)
}
