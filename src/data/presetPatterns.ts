import type { Pattern } from '../audio/types'

/**
 * Click — adapts to current time signature: accent on beat 1, normal on the rest.
 * Generated dynamically because the user can pick any time signature.
 */
export function makeClickPattern(timeSignature: [number, number]): Pattern {
  const beatsPerBar = timeSignature[0]
  return {
    id: 'click',
    name: 'Click',
    timeSignature,
    subdivision: 1,
    tracks: [
      {
        sound: 'click',
        steps: [2, ...Array(beatsPerBar - 1).fill(1)],
      },
    ],
  }
}

/**
 * Static drum patterns. Each step value: 0=rest, 1=normal, 2=accent.
 * Step layout for 4/4 + subdivision=2 (8 steps): beats are 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5
 */
export const STATIC_PATTERNS: Pattern[] = [
  {
    id: 'rock-8',
    name: 'Rock 8 Beat',
    timeSignature: [4, 4],
    subdivision: 2,
    tracks: [
      { sound: 'hihat', steps: [1, 1, 1, 1, 1, 1, 1, 1] },
      { sound: 'snare', steps: [0, 0, 1, 0, 0, 0, 1, 0] },
      { sound: 'kick',  steps: [2, 0, 0, 0, 1, 0, 0, 0] },
    ],
  },
  {
    id: 'rock-16',
    name: 'Rock 16 Beat',
    timeSignature: [4, 4],
    subdivision: 4,
    tracks: [
      { sound: 'hihat', steps: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1] },
      { sound: 'snare', steps: [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0] },
      { sound: 'kick',  steps: [2, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0] },
    ],
  },
  {
    id: 'bossa',
    name: 'Bossa Nova',
    timeSignature: [4, 4],
    subdivision: 2,
    tracks: [
      { sound: 'hihat', steps: [1, 1, 1, 1, 1, 1, 1, 1] },
      { sound: 'snare', steps: [1, 0, 0, 1, 0, 1, 0, 0] },
      { sound: 'kick',  steps: [2, 0, 0, 1, 1, 0, 0, 1] },
    ],
  },
  {
    id: 'swing',
    name: 'Swing',
    timeSignature: [4, 4],
    subdivision: 3,
    tracks: [
      // Ride pattern: dah dum-dah dah dum-dah ...
      { sound: 'hihat', steps: [1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1] },
      { sound: 'snare', steps: [0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0] },
      { sound: 'kick',  steps: [2, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0] },
    ],
  },
  {
    id: 'waltz',
    name: 'Waltz 3/4',
    timeSignature: [3, 4],
    subdivision: 2,
    tracks: [
      { sound: 'hihat', steps: [1, 1, 1, 1, 1, 1] },
      { sound: 'snare', steps: [0, 0, 1, 0, 1, 0] },
      { sound: 'kick',  steps: [2, 0, 0, 0, 0, 0] },
    ],
  },
]
