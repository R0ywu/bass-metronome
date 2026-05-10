import type { DrumSound } from './types'

/**
 * Synthesized drum sounds using Web Audio primitives — no samples.
 * - click: pure sine pip (Phase 1 behaviour)
 * - kick:  pitched sine with downward freq sweep
 * - snare: filtered noise + tone body
 * - hihat: high-pass filtered short noise burst
 */
export class SoundBank {
  private readonly ctx: AudioContext
  private readonly noiseBuffer: AudioBuffer

  constructor(ctx: AudioContext) {
    this.ctx = ctx
    this.noiseBuffer = this.createNoiseBuffer()
  }

  play(sound: DrumSound, when: number, accent: boolean): void {
    switch (sound) {
      case 'click': this.synthClick(when, accent); break
      case 'kick':  this.synthKick(when, accent); break
      case 'snare': this.synthSnare(when, accent); break
      case 'hihat': this.synthHihat(when, accent); break
    }
  }

  private synthClick(when: number, accent: boolean): void {
    const osc = this.ctx.createOscillator()
    const gain = this.ctx.createGain()
    const freq = accent ? 1500 : 800
    const volume = accent ? 0.6 : 0.4
    const duration = accent ? 0.05 : 0.04

    osc.frequency.setValueAtTime(freq, when)
    osc.type = 'sine'
    gain.gain.setValueAtTime(0, when)
    gain.gain.linearRampToValueAtTime(volume, when + 0.001)
    gain.gain.exponentialRampToValueAtTime(0.0001, when + duration)

    osc.connect(gain).connect(this.ctx.destination)
    osc.start(when)
    osc.stop(when + duration + 0.05)
  }

  private synthKick(when: number, accent: boolean): void {
    const osc = this.ctx.createOscillator()
    const gain = this.ctx.createGain()
    const volume = accent ? 0.9 : 0.7
    const duration = 0.18

    osc.type = 'sine'
    // Pitch sweep: 110 → 40 Hz over 80ms
    osc.frequency.setValueAtTime(110, when)
    osc.frequency.exponentialRampToValueAtTime(40, when + 0.08)

    gain.gain.setValueAtTime(0, when)
    gain.gain.linearRampToValueAtTime(volume, when + 0.002)
    gain.gain.exponentialRampToValueAtTime(0.0001, when + duration)

    osc.connect(gain).connect(this.ctx.destination)
    osc.start(when)
    osc.stop(when + duration + 0.05)
  }

  private synthSnare(when: number, accent: boolean): void {
    const volume = accent ? 0.7 : 0.5
    const duration = 0.15

    // Noise component (bandpass-filtered around 2kHz)
    const noise = this.ctx.createBufferSource()
    noise.buffer = this.noiseBuffer
    const noiseFilter = this.ctx.createBiquadFilter()
    noiseFilter.type = 'bandpass'
    noiseFilter.frequency.value = 2000
    noiseFilter.Q.value = 0.7
    const noiseGain = this.ctx.createGain()
    noiseGain.gain.setValueAtTime(0, when)
    noiseGain.gain.linearRampToValueAtTime(volume * 0.7, when + 0.001)
    noiseGain.gain.exponentialRampToValueAtTime(0.0001, when + duration)
    noise.connect(noiseFilter).connect(noiseGain).connect(this.ctx.destination)
    noise.start(when)
    noise.stop(when + duration + 0.05)

    // Body tone (~200Hz triangle)
    const body = this.ctx.createOscillator()
    body.type = 'triangle'
    body.frequency.setValueAtTime(220, when)
    const bodyGain = this.ctx.createGain()
    bodyGain.gain.setValueAtTime(0, when)
    bodyGain.gain.linearRampToValueAtTime(volume * 0.4, when + 0.001)
    bodyGain.gain.exponentialRampToValueAtTime(0.0001, when + 0.08)
    body.connect(bodyGain).connect(this.ctx.destination)
    body.start(when)
    body.stop(when + 0.1)
  }

  private synthHihat(when: number, accent: boolean): void {
    const volume = accent ? 0.45 : 0.25
    const duration = accent ? 0.06 : 0.035

    const noise = this.ctx.createBufferSource()
    noise.buffer = this.noiseBuffer
    const filter = this.ctx.createBiquadFilter()
    filter.type = 'highpass'
    filter.frequency.value = 7000
    const gain = this.ctx.createGain()
    gain.gain.setValueAtTime(0, when)
    gain.gain.linearRampToValueAtTime(volume, when + 0.001)
    gain.gain.exponentialRampToValueAtTime(0.0001, when + duration)

    noise.connect(filter).connect(gain).connect(this.ctx.destination)
    noise.start(when)
    noise.stop(when + duration + 0.05)
  }

  /** 1-second white noise buffer reused by snare and hi-hat. */
  private createNoiseBuffer(): AudioBuffer {
    const length = this.ctx.sampleRate
    const buffer = this.ctx.createBuffer(1, length, this.ctx.sampleRate)
    const data = buffer.getChannelData(0)
    for (let i = 0; i < length; i++) {
      data[i] = Math.random() * 2 - 1
    }
    return buffer
  }
}
