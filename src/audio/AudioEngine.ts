import { Scheduler } from './Scheduler'
import { SoundBank } from './SoundBank'
import type { BeatCallback } from './types'

/**
 * Singleton facade for audio playback.
 * AudioContext must be created/resumed via user gesture (browser policy).
 */
export class AudioEngine {
  private ctx: AudioContext | null = null
  private scheduler: Scheduler | null = null

  async init(
    getBpm: () => number,
    getBeatsPerBar: () => number,
    onBeat: BeatCallback,
  ): Promise<void> {
    if (this.ctx) return

    this.ctx = new AudioContext()
    if (this.ctx.state === 'suspended') {
      await this.ctx.resume()
    }
    const soundBank = new SoundBank(this.ctx)
    this.scheduler = new Scheduler(this.ctx, soundBank, getBpm, getBeatsPerBar, onBeat)
  }

  start(): void {
    this.scheduler?.start()
  }

  stop(): void {
    this.scheduler?.stop()
  }

  get isReady(): boolean {
    return this.ctx !== null
  }
}

export const audioEngine = new AudioEngine()
