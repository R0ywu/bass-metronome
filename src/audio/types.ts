export type DrumSound = 'click' | 'kick' | 'snare' | 'hihat'

export interface Track {
  sound: DrumSound
  /** 0 = rest, 1 = normal hit, 2 = accent hit */
  steps: number[]
}

export interface Pattern {
  id: string
  name: string
  timeSignature: [number, number]
  /** Steps per beat. 1 = quarter notes, 2 = 8th notes, 4 = 16th notes, 3 = triplets. */
  subdivision: number
  tracks: Track[]
}

/** Fired when a scheduled step plays. */
export type StepCallback = (step: number) => void
