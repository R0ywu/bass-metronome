import { SoundBank } from './SoundBank'
import type { Intensity, Pattern, StepCallback } from './types'

/**
 * Lookahead Scheduler — based on Chris Wilson's pattern:
 * https://www.html5rocks.com/en/tutorials/audio/scheduling/
 *
 * Pattern-driven, step-based: each tick of the inner clock advances by one
 * subdivision step. The current Pattern decides which tracks fire at each step.
 */
export class Scheduler {
  private timerId: number | null = null
  private nextNoteTime = 0
  private currentStep = 0

  private readonly scheduleAheadTime = 0.1
  private readonly lookaheadInterval = 25

  private notesInQueue: Array<{ step: number; time: number }> = []

  private readonly ctx: AudioContext
  private readonly soundBank: SoundBank
  private readonly getBpm: () => number
  private readonly getPattern: () => Pattern
  private readonly onStep: StepCallback

  constructor(
    ctx: AudioContext,
    soundBank: SoundBank,
    getBpm: () => number,
    getPattern: () => Pattern,
    onStep: StepCallback,
  ) {
    this.ctx = ctx
    this.soundBank = soundBank
    this.getBpm = getBpm
    this.getPattern = getPattern
    this.onStep = onStep
  }

  start(): void {
    if (this.timerId !== null) return
    this.currentStep = 0
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
      // Snapshot the pattern once per tick so scheduleStep + advance stay
      // consistent even if the user switches pattern mid-tick.
      const pattern = this.getPattern()
      this.scheduleStep(pattern, this.currentStep, this.nextNoteTime)
      this.advance(pattern)
    }
    this.timerId = window.setTimeout(() => this.scheduler(), this.lookaheadInterval)
  }

  private scheduleStep(pattern: Pattern, step: number, time: number): void {
    this.notesInQueue.push({ step, time })
    for (const track of pattern.tracks) {
      const value = track.steps[step] ?? 0
      if (value < 1 || value > 3) continue
      this.soundBank.play(track.sound, time, value as Intensity)
    }
  }

  private advance(pattern: Pattern): void {
    const stepDuration = 60.0 / this.getBpm() / pattern.subdivision
    this.nextNoteTime += stepDuration
    const totalSteps = pattern.timeSignature[0] * pattern.subdivision
    this.currentStep = (this.currentStep + 1) % totalSteps
  }

  /**
   * Visual tick — fires onStep callback at the precise moment a queued note
   * crosses the current audio clock. Decoupled from audio scheduling so UI
   * lag never affects timing.
   */
  private uiTick = (): void => {
    if (this.timerId === null) return
    const now = this.ctx.currentTime
    while (this.notesInQueue.length && this.notesInQueue[0].time <= now) {
      const note = this.notesInQueue.shift()!
      this.onStep(note.step)
    }
    requestAnimationFrame(this.uiTick)
  }
}
