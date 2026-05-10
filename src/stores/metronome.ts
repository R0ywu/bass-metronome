import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { audioEngine } from '../audio/AudioEngine'
import { STATIC_PATTERNS, makeClickPattern } from '../data/presetPatterns'
import { useCustomPatternStore } from './customPatterns'
import type { Pattern } from '../audio/types'

export const MIN_BPM = 30
export const MAX_BPM = 300
export const DEFAULT_BPM = 120

export type TimeSignature = [number, number]

export const useMetronomeStore = defineStore('metronome', () => {
  const bpm = ref(DEFAULT_BPM)
  const isPlaying = ref(false)
  const currentStep = ref(-1)

  // Pattern state — Click is the default, time signature defaults to 4/4
  const currentPatternId = ref<string>('click')
  const clickTimeSignature = ref<TimeSignature>([4, 4])

  const customStore = useCustomPatternStore()

  const currentPattern = computed<Pattern>(() => {
    if (currentPatternId.value === 'click') {
      return makeClickPattern(clickTimeSignature.value)
    }
    const preset = STATIC_PATTERNS.find((p) => p.id === currentPatternId.value)
    if (preset) return preset
    const custom = customStore.find(currentPatternId.value)
    if (custom) return custom
    return makeClickPattern(clickTimeSignature.value)
  })

  const timeSignature = computed<TimeSignature>(() => currentPattern.value.timeSignature)
  const beatsPerBar = computed(() => timeSignature.value[0])
  const subdivision = computed(() => currentPattern.value.subdivision)

  const currentBeat = computed(() => {
    if (currentStep.value < 0) return -1
    return Math.floor(currentStep.value / subdivision.value)
  })

  function setBpm(value: number): void {
    bpm.value = Math.max(MIN_BPM, Math.min(MAX_BPM, Math.round(value)))
  }

  /**
   * Manually changing time signature implicitly switches to the Click pattern
   * (no other preset adapts to arbitrary time signatures).
   */
  function setTimeSignature(sig: TimeSignature): void {
    clickTimeSignature.value = [sig[0], sig[1]]
    currentPatternId.value = 'click'
    currentStep.value = -1
  }

  function selectPattern(id: string): void {
    currentPatternId.value = id
    currentStep.value = -1
  }

  /** Delete a custom pattern; if it was active, fall back to Click. */
  function removeCustomPattern(id: string): void {
    customStore.remove(id)
    if (currentPatternId.value === id) {
      selectPattern('click')
    }
  }

  async function toggle(): Promise<void> {
    if (!audioEngine.isReady) {
      await audioEngine.init(
        () => bpm.value,
        () => currentPattern.value,
        (step) => { currentStep.value = step },
      )
    }
    if (isPlaying.value) {
      audioEngine.stop()
      isPlaying.value = false
      currentStep.value = -1
    } else {
      audioEngine.start()
      isPlaying.value = true
    }
  }

  return {
    bpm,
    isPlaying,
    currentStep,
    currentBeat,
    currentPatternId,
    timeSignature,
    beatsPerBar,
    setBpm,
    setTimeSignature,
    selectPattern,
    removeCustomPattern,
    toggle,
  }
})
