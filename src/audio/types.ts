export type DrumSound = 'click' | 'kick' | 'snare' | 'hihat'

/** Hit intensity passed to SoundBank — non-zero only. */
export type Intensity = 1 | 2 | 3

export interface Track {
  sound: DrumSound
  /** 0 = mute, 1 = weak, 2 = medium, 3 = strong */
  steps: number[]
}

export interface Pattern {
  id: string
  name: string
  timeSignature: [number, number]
  /** Steps per beat. 1 = quarter, 2 = 8th, 3 = triplet, 4 = 16th, 6 = sextuplet. */
  subdivision: number
  tracks: Track[]
}

/** Fired when a scheduled step plays. */
export type StepCallback = (step: number) => void
