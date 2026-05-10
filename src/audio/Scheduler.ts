import { SoundBank } from './SoundBank'
import type { BeatCallback } from './types'

/**
 * Lookahead Scheduler — based on Chris Wilson's pattern:
 * https://www.html5rocks.com/en/tutorials/audio/scheduling/
 *
 * Why: setInterval/setTimeout drift due to JS event loop jitter.
 * Solution: schedule notes ahead of time on the precise AudioContext clock,
 * and use a coarse setTimeout (every 25ms) only to refill the schedule queue.
 */
export class Scheduler {
  private timerId: number | null = null
  private nextNoteTime = 0
  private currentBeatInBar = 0

  /** How far ahead to schedule audio (seconds). */
  private readonly scheduleAheadTime = 0.1
  /** How frequently to call the scheduler function (ms). */
  private readonly lookaheadInterval = 25

  /** Queue of upcoming beats — used by UI to flash on time. */
  private notesInQueue: Array<{ beatInBar: number; time: number }> = []

  constructor(
    private ctx: AudioContext,
    private soundBank: SoundBank,
    private getBpm: () => number,
    private getBeatsPerBar: () => number,
    private onBeat: BeatCallback,
  ) {}

  start(): void {
    if (this.timerId !== null) return
    this.currentBeatInBar = 0
    this.nextNoteTime = this.ctx.currentTime + 0.05
    this.scheduler()
    this.uiTick()
  }

  stop(): void {
    if (this.timerId !== null) {
      window.clearTimeout(this.timerId)
      this.timerId = null
    }
    this.notesInQueue = []
  }

  private scheduler(): void {
    while (this.nextNoteTime < this.ctx.currentTime + this.scheduleAheadTime) {
      this.scheduleNote(this.currentBeatInBar, this.nextNoteTime)
      this.advance()
    }
    this.timerId = window.setTimeout(() => this.scheduler(), this.lookaheadInterval)
  }

  private scheduleNote(beatInBar: number, time: number): void {
    this.notesInQueue.push({ beatInBar, time })
    const isAccent = beatInBar === 0
    this.soundBank.play(isAccent ? 'accent' : 'normal', time)
  }

  private advance(): void {
    const secondsPerBeat = 60.0 / this.getBpm()
    this.nextNoteTime += secondsPerBeat
    const beatsPerBar = this.getBeatsPerBar()
    this.currentBeatInBar = (this.currentBeatInBar + 1) % beatsPerBar
  }

  /**
   * Visual tick — fires onBeat callback at the precise moment a queued note
   * crosses the current audio clock. Decoupled from audio scheduling so UI
   * lag never affects timing.
   */
  private uiTick = (): void => {
    if (this.timerId === null) return
    const now = this.ctx.currentTime
    while (this.notesInQueue.length && this.notesInQueue[0].time <= now) {
      const note = this.notesInQueue.shift()!
      this.onBeat(note.beatInBar)
    }
    requestAnimationFrame(this.uiTick)
  }
}
