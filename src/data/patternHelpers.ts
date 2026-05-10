import type { Pattern, Track, DrumSound } from '../audio/types'

const FIXED_TRACKS: DrumSound[] = ['kick', 'snare', 'hihat']
const VALID_SOUNDS: readonly string[] = ['click', 'kick', 'snare', 'hihat']
const VALID_STEP_VALUES = new Set([0, 1, 2, 3])
export const ALLOWED_NUMERATORS = [2, 3, 4, 5, 6, 7] as const
export const ALLOWED_DENOMINATORS = [4, 8] as const
export const ALLOWED_SUBDIVISIONS = [1, 2, 3, 4] as const

/** Total step count for a given time signature numerator and subdivision. */
export function totalSteps(beatsPerBar: number, subdivision: number): number {
  return beatsPerBar * subdivision
}

/** Build an empty custom pattern with the three fixed tracks. */
export function createDefaultPattern(): Pattern {
  const beatsPerBar = 4
  const subdivision = 2
  const length = totalSteps(beatsPerBar, subdivision)
  return {
    id: crypto.randomUUID(),
    name: 'New Pattern',
    timeSignature: [beatsPerBar, 4],
    subdivision,
    tracks: FIXED_TRACKS.map((sound) => ({
      sound,
      steps: Array(length).fill(0),
    })),
  }
}

/**
 * Truncate or pad each track's steps to match the new length.
 * Existing values are preserved when shrinking from the front.
 */
export function reshapeTracks(tracks: Track[], newLength: number): Track[] {
  return tracks.map((track) => {
    const next = track.steps.slice(0, newLength)
    while (next.length < newLength) next.push(0)
    return { ...track, steps: next }
  })
}

/** Lightweight runtime guard — used when reading from localStorage / file. */
export function isValidPattern(p: unknown): p is Pattern {
  if (!p || typeof p !== 'object') return false
  const obj = p as Record<string, unknown>
  return (
    typeof obj.id === 'string' &&
    obj.id.length > 0 &&
    typeof obj.name === 'string' &&
    obj.name.length > 0 &&
    Array.isArray(obj.timeSignature) &&
    obj.timeSignature.length === 2 &&
    typeof obj.timeSignature[0] === 'number' &&
    obj.timeSignature[0] > 0 &&
    typeof obj.timeSignature[1] === 'number' &&
    obj.timeSignature[1] > 0 &&
    typeof obj.subdivision === 'number' &&
    obj.subdivision > 0 &&
    Array.isArray(obj.tracks) &&
    obj.tracks.length > 0 &&
    obj.tracks.every((t) => {
      if (!t || typeof t !== 'object') return false
      const track = t as Track
      return (
        typeof track.sound === 'string' &&
        VALID_SOUNDS.includes(track.sound) &&
        Array.isArray(track.steps) &&
        track.steps.every((v) => typeof v === 'number' && VALID_STEP_VALUES.has(v))
      )
    })
  )
}

/** Trigger a browser download of a single pattern as JSON. */
export function downloadPatternAsJson(pattern: Pattern): void {
  const blob = new Blob([JSON.stringify(pattern, null, 2)], {
    type: 'application/json',
  })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${pattern.name.replace(/[^a-z0-9-_]/gi, '_') || 'pattern'}.json`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

/** Read a JSON file as a Pattern, returning null if invalid. */
export function readPatternFromFile(file: File): Promise<Pattern | null> {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result as string)
        if (!isValidPattern(parsed)) {
          resolve(null)
          return
        }
        // Always assign a fresh ID on import to avoid collisions
        resolve({ ...parsed, id: crypto.randomUUID() })
      } catch {
        resolve(null)
      }
    }
    reader.onerror = () => resolve(null)
    reader.readAsText(file)
  })
}
