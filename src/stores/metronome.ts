import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { audioEngine } from '../audio/AudioEngine'

export const MIN_BPM = 30
export const MAX_BPM = 300
export const DEFAULT_BPM = 120

export type TimeSignature = [number, number]

export const useMetronomeStore = defineStore('metronome', () => {
  const bpm = ref(DEFAULT_BPM)
  const timeSignature = ref<TimeSignature>([4, 4])
  const isPlaying = ref(false)
  const currentBeat = ref(-1) // -1 means no beat yet

  const beatsPerBar = computed(() => timeSignature.value[0])

  function setBpm(value: number): void {
    bpm.value = Math.max(MIN_BPM, Math.min(MAX_BPM, Math.round(value)))
  }

  function setTimeSignature(sig: TimeSignature): void {
    timeSignature.value = sig
    // Reset beat counter so new bar starts cleanly
    currentBeat.value = -1
  }

  async function toggle(): Promise<void> {
    if (!audioEngine.isReady) {
      await audioEngine.init(
        () => bpm.value,
        () => beatsPerBar.value,
        handleBeat,
      )
    }
    if (isPlaying.value) {
      audioEngine.stop()
      isPlaying.value = false
      currentBeat.value = -1
    } else {
      audioEngine.start()
      isPlaying.value = true
    }
  }

  function handleBeat(beatInBar: number): void {
    currentBeat.value = beatInBar
  }

  return {
    bpm,
    timeSignature,
    isPlaying,
    currentBeat,
    beatsPerBar,
    setBpm,
    setTimeSignature,
    toggle,
  }
})
