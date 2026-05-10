import type { DrumSound, Intensity } from './types'

const CLICK_PARAMS: Record<Intensity, { freq: number; volume: number; duration: number }> = {
  1: { freq: 600,  volume: 0.25, duration: 0.035 },
  2: { freq: 800,  volume: 0.40, duration: 0.040 },
  3: { freq: 1500, volume: 0.60, duration: 0.050 },
}

const KICK_PARAMS: Record<Intensity, { startFreq: number; endFreq: number; volume: number }> = {
  1: { startFreq: 90,  endFreq: 35, volume: 0.50 },
  2: { startFreq: 110, endFreq: 40, volume: 0.70 },
  3: { startFreq: 130, endFreq: 45, volume: 0.95 },
}

const SNARE_PARAMS: Record<Intensity, { volume: number }> = {
  1: { volume: 0.35 },
  2: { volume: 0.50 },
  3: { volume: 0.75 },
}

const HIHAT_PARAMS: Record<Intensity, { volume: number; duration: number }> = {
  1: { volume: 0.18, duration: 0.025 },
  2: { volume: 0.28, duration: 0.040 },
  3: { volume: 0.45, duration: 0.060 },
}

/**
 * Synthesized drum sounds using Web Audio primitives — no samples.
 * Each sound supports three intensity levels (weak / medium / strong)
 * driven by volume, duration, and (for kick) pitch envelope depth.
 */
export class SoundBank {
  private readonly ctx: AudioContext
  private readonly noiseBuffer: AudioBuffer

  constructor(ctx: AudioContext) {
    this.ctx = ctx
    this.noiseBuffer = this.createNoiseBuffer()
  }

  play(sound: DrumSound, when: number, intensity: Intensity): void {
    switch (sound) {
      case 'click': this.synthClick(when, intensity); break
      case 'kick':  this.synthKick(when, intensity); break
      case 'snare': this.synthSnare(when, intensity); break
      case 'hihat': this.synthHihat(when, intensity); break
    }
  }

  private synthClick(when: number, intensity: Intensity): void {
    const params = CLICK_PARAMS[intensity]
    const osc = this.ctx.createOscillator()
    const gain = this.ctx.createGain()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(params.freq, when)
    gain.gain.setValueAtTime(0, when)
    gain.gain.linearRampToValueAtTime(params.volume, when + 0.001)
    gain.gain.exponentialRampToValueAtTime(0.0001, when + params.duration)
    osc.connect(gain).connect(this.ctx.destination)
    osc.start(when)
    osc.stop(when + params.duration + 0.05)
  }

  private synthKick(when: number, intensity: Intensity): void {
    const params = KICK_PARAMS[intensity]
    const osc = this.ctx.createOscillator()
    const gain = this.ctx.createGain()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(params.startFreq, when)
    osc.frequency.exponentialRampToValueAtTime(params.endFreq, when + 0.08)
    gain.gain.setValueAtTime(0, when)
    gain.gain.linearRampToValueAtTime(params.volume, when + 0.002)
    gain.gain.exponentialRampToValueAtTime(0.0001, when + 0.18)
    osc.connect(gain).connect(this.ctx.destination)
    osc.start(when)
    osc.stop(when + 0.23)
  }

  private synthSnare(when: number, intensity: Intensity): void {
    const { volume } = SNARE_PARAMS[intensity]
    const duration = 0.15

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

  private synthHihat(when: number, intensity: Intensity): void {
    const params = HIHAT_PARAMS[intensity]
    const noise = this.ctx.createBufferSource()
    noise.buffer = this.noiseBuffer
    const filter = this.ctx.createBiquadFilter()
    filter.type = 'highpass'
    filter.frequency.value = 7000
    const gain = this.ctx.createGain()
    gain.gain.setValueAtTime(0, when)
    gain.gain.linearRampToValueAtTime(params.volume, when + 0.001)
    gain.gain.exponentialRampToValueAtTime(0.0001, when + params.duration)
    noise.connect(filter).connect(gain).connect(this.ctx.destination)
    noise.start(when)
    noise.stop(when + params.duration + 0.05)
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
