import { Scheduler } from './Scheduler'
import { SoundBank } from './SoundBank'
import type { Pattern, StepCallback } from './types'

/**
 * Singleton facade for audio playback.
 * AudioContext must be created/resumed via user gesture (browser policy).
 */
export class AudioEngine {
  private ctx: AudioContext | null = null
  private scheduler: Scheduler | null = null

  async init(
    getBpm: () => number,
    getPattern: () => Pattern,
    onStep: StepCallback,
  ): Promise<void> {
    if (this.ctx) return

    this.ctx = new AudioContext()
    if (this.ctx.state === 'suspended') {
      await this.ctx.resume()
    }
    const soundBank = new SoundBank(this.ctx)
    this.scheduler = new Scheduler(this.ctx, soundBank, getBpm, getPattern, onStep)
  }

  async start(): Promise<void> {
    if (!this.ctx || !this.scheduler) return
    // Browsers may suspend the AudioContext when the tab loses focus;
    // resume before resuming playback so timing stays accurate.
    if (this.ctx.state === 'suspended') {
      await this.ctx.resume()
    }
    this.scheduler.start()
  }

  stop(): void {
    this.scheduler?.stop()
  }

  get isReady(): boolean {
    return this.ctx !== null
  }
}

export const audioEngine = new AudioEngine()
