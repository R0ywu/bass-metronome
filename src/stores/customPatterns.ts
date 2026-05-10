import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import type { Pattern } from '../audio/types'
import { createDefaultPattern, isValidPattern } from '../data/patternHelpers'

const STORAGE_KEY = 'metronome:customPatterns'
const SAVE_DEBOUNCE_MS = 300

function loadFromStorage(): Pattern[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.filter(isValidPattern)
  } catch (e) {
    console.warn('[customPatterns] load failed:', e)
    return []
  }
}

function saveToStorage(patterns: Pattern[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(patterns))
  } catch (e) {
    console.warn('[customPatterns] save failed:', e)
  }
}

export const useCustomPatternStore = defineStore('customPatterns', () => {
  const patterns = ref<Pattern[]>(loadFromStorage())

  // Debounce writes so a flurry of keystrokes/clicks coalesces into one save.
  let saveTimer: number | null = null
  const flush = (): void => {
    if (saveTimer === null) return
    window.clearTimeout(saveTimer)
    saveTimer = null
    saveToStorage(patterns.value)
  }
  watch(
    patterns,
    () => {
      if (saveTimer !== null) window.clearTimeout(saveTimer)
      saveTimer = window.setTimeout(() => {
        saveTimer = null
        saveToStorage(patterns.value)
      }, SAVE_DEBOUNCE_MS)
    },
    { deep: true },
  )
  // Don't lose the in-flight edit if the user closes the tab.
  window.addEventListener('beforeunload', flush)

  function find(id: string): Pattern | undefined {
    return patterns.value.find((p) => p.id === id)
  }

  function create(): Pattern {
    const p = createDefaultPattern()
    patterns.value.push(p)
    return p
  }

  function remove(id: string): void {
    patterns.value = patterns.value.filter((p) => p.id !== id)
  }

  function add(pattern: Pattern): void {
    patterns.value.push(pattern)
  }

  /**
   * Apply a mutation to the pattern with the given id; no-op if not found.
   * The mutator MUST mutate the passed object's properties — reassigning the
   * parameter (e.g. `p => p = newPattern`) will silently do nothing because it
   * only changes the local binding, not the array entry.
   */
  function update(id: string, mutator: (pattern: Pattern) => void): void {
    const target = patterns.value.find((p) => p.id === id)
    if (!target) return
    mutator(target)
  }

  return { patterns, find, create, remove, add, update }
})
