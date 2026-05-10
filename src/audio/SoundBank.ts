import type { SoundType } from './types'

/**
 * Synthesized click sounds using Web Audio oscillators.
 * No samples needed — pure DSP.
 */
export class SoundBank {
  constructor(private ctx: AudioContext) {}

  play(type: SoundType, when: number): void {
    const osc = this.ctx.createOscillator()
    const gain = this.ctx.createGain()

    const config = this.getConfig(type)

    osc.frequency.setValueAtTime(config.freq, when)
    osc.type = 'sine'

    // Quick attack + exponential decay = "click" envelope
    gain.gain.setValueAtTime(0, when)
    gain.gain.linearRampToValueAtTime(config.volume, when + 0.001)
    gain.gain.exponentialRampToValueAtTime(0.0001, when + config.duration)

    osc.connect(gain).connect(this.ctx.destination)
    osc.start(when)
    osc.stop(when + config.duration + 0.05)
  }

  private getConfig(type: SoundType): { freq: number; volume: number; duration: number } {
    switch (type) {
      case 'accent':
        return { freq: 1500, volume: 0.6, duration: 0.05 }
      case 'normal':
        return { freq: 800, volume: 0.4, duration: 0.04 }
    }
  }
}
