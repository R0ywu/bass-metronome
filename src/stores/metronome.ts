import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { audioEngine } from '../audio/AudioEngine'
import { STATIC_PATTERNS, makeClickPattern } from '../data/presetPatterns'
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
  const clickBeatsPerBar = ref(4)

  const currentPattern = computed<Pattern>(() => {
    if (currentPatternId.value === 'click') {
      return makeClickPattern(clickBeatsPerBar.value)
    }
    const found = STATIC_PATTERNS.find((p) => p.id === currentPatternId.value)
    return found ?? makeClickPattern(clickBeatsPerBar.value)
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
    clickBeatsPerBar.value = sig[0]
    currentPatternId.value = 'click'
    currentStep.value = -1
  }

  function selectPattern(id: string): void {
    currentPatternId.value = id
    currentStep.value = -1
  }

  async function toggle(): Promise<void> {
    if (!audioEngine.isReady) {
      await audioEngine.init(
        () => bpm.value,
        () => currentPattern.value,
        handleStep,
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

  function handleStep(step: number): void {
    currentStep.value = step
  }

  return {
    bpm,
    isPlaying,
    currentBeat,
    currentPatternId,
    timeSignature,
    beatsPerBar,
    setBpm,
    setTimeSignature,
    selectPattern,
    toggle,
  }
})
