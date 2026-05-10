import type { Pattern } from '../audio/types'

/**
 * Click — adapts to the current time signature.
 * Beat 1 is strong (3); the rest are weak (1).
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
        steps: [3, ...Array(beatsPerBar - 1).fill(1)],
      },
    ],
  }
}

/**
 * Static drum patterns. Step values use the 4-level scheme:
 *   0 = mute, 1 = weak, 2 = medium, 3 = strong
 * Step layout for 4/4 + subdivision=2 (8 steps): beats are 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5
 */
export const STATIC_PATTERNS: Pattern[] = [
  {
    id: 'rock-8',
    name: 'Rock 8 Beat',
    timeSignature: [4, 4],
    subdivision: 2,
    tracks: [
      // Hi-hat: accent the downbeat of each beat
      { sound: 'hihat', steps: [2, 1, 2, 1, 2, 1, 2, 1] },
      // Snare: strong backbeat on 2 and 4
      { sound: 'snare', steps: [0, 0, 3, 0, 0, 0, 3, 0] },
      // Kick: strong on 1, medium on 3
      { sound: 'kick',  steps: [3, 0, 0, 0, 2, 0, 0, 0] },
    ],
  },
  {
    id: 'rock-16',
    name: 'Rock 16 Beat',
    timeSignature: [4, 4],
    subdivision: 4,
    tracks: [
      { sound: 'hihat', steps: [2, 1, 1, 1, 2, 1, 1, 1, 2, 1, 1, 1, 2, 1, 1, 1] },
      { sound: 'snare', steps: [0, 0, 0, 0, 3, 0, 0, 0, 0, 0, 0, 0, 3, 0, 0, 0] },
      { sound: 'kick',  steps: [3, 0, 0, 0, 0, 0, 0, 0, 2, 0, 2, 0, 0, 0, 0, 0] },
    ],
  },
  {
    id: 'bossa',
    name: 'Bossa Nova',
    timeSignature: [4, 4],
    subdivision: 2,
    tracks: [
      { sound: 'hihat', steps: [1, 1, 1, 1, 1, 1, 1, 1] },
      // Clave-ish snare
      { sound: 'snare', steps: [2, 0, 0, 2, 0, 2, 0, 0] },
      { sound: 'kick',  steps: [3, 0, 0, 1, 1, 0, 0, 1] },
    ],
  },
  {
    id: 'swing',
    name: 'Swing',
    timeSignature: [4, 4],
    subdivision: 3,
    tracks: [
      // Ride pattern: dah dum-dah dah dum-dah ...
      { sound: 'hihat', steps: [2, 0, 1, 1, 0, 1, 2, 0, 1, 1, 0, 1] },
      { sound: 'snare', steps: [0, 0, 0, 0, 0, 0, 3, 0, 0, 0, 0, 0] },
      { sound: 'kick',  steps: [3, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0] },
    ],
  },
  {
    id: 'waltz',
    name: 'Waltz 3/4',
    timeSignature: [3, 4],
    subdivision: 2,
    tracks: [
      { sound: 'hihat', steps: [2, 1, 1, 1, 1, 1] },
      { sound: 'snare', steps: [0, 0, 2, 0, 2, 0] },
      { sound: 'kick',  steps: [3, 0, 0, 0, 0, 0] },
    ],
  },
]
