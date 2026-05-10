export type SoundType = 'accent' | 'normal'

/** Fired when a scheduled beat plays. */
export type BeatCallback = (beatInBar: number) => void
