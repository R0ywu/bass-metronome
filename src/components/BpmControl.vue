<script setup lang="ts">
import { ref } from 'vue'
import { useMetronomeStore, MIN_BPM, MAX_BPM } from '../stores/metronome'

const store = useMetronomeStore()

// Tap Tempo: keep recent intervals, average them
const tapTimes = ref<number[]>([])
const TAP_RESET_MS = 2000
const MAX_TAPS = 4

function tap(): void {
  const now = performance.now()
  if (tapTimes.value.length && now - tapTimes.value[tapTimes.value.length - 1] > TAP_RESET_MS) {
    tapTimes.value = []
  }
  tapTimes.value.push(now)
  if (tapTimes.value.length > MAX_TAPS) tapTimes.value.shift()

  if (tapTimes.value.length >= 2) {
    const intervals: number[] = []
    for (let i = 1; i < tapTimes.value.length; i++) {
      intervals.push(tapTimes.value[i] - tapTimes.value[i - 1])
    }
    const avgMs = intervals.reduce((a, b) => a + b, 0) / intervals.length
    const newBpm = 60000 / avgMs
    store.setBpm(newBpm)
  }
}

function adjust(delta: number): void {
  store.setBpm(store.bpm + delta)
}

function onInput(e: Event): void {
  const target = e.target as HTMLInputElement
  const v = parseInt(target.value, 10)
  if (!isNaN(v)) store.setBpm(v)
}
</script>

<template>
  <div class="flex flex-col items-center gap-4 p-6 bg-bg-panel rounded-2xl border border-bg-elevated">
    <div class="text-xs uppercase tracking-widest text-gray-500">Tempo</div>

    <div class="flex items-baseline gap-2">
      <input
        type="number"
        :value="store.bpm"
        :min="MIN_BPM"
        :max="MAX_BPM"
        @input="onInput"
        class="w-32 bg-transparent text-7xl font-bold text-neon-cyan text-glow-cyan text-right outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
      />
      <span class="text-sm text-gray-500 uppercase tracking-wider">bpm</span>
    </div>

    <input
      type="range"
      :min="MIN_BPM"
      :max="MAX_BPM"
      :value="store.bpm"
      @input="onInput"
      class="w-full accent-neon-cyan"
    />

    <div class="flex gap-2 w-full">
      <button
        @click="adjust(-1)"
        class="flex-1 py-2 bg-bg-elevated hover:bg-neon-cyan/20 text-neon-cyan rounded-lg border border-bg-elevated hover:border-neon-cyan/50 transition"
      >−1</button>
      <button
        @click="adjust(-5)"
        class="flex-1 py-2 bg-bg-elevated hover:bg-neon-cyan/20 text-neon-cyan rounded-lg border border-bg-elevated hover:border-neon-cyan/50 transition"
      >−5</button>
      <button
        @click="tap"
        class="flex-[2] py-2 bg-neon-pink/10 hover:bg-neon-pink/30 text-neon-pink rounded-lg border border-neon-pink/40 transition font-bold"
      >TAP</button>
      <button
        @click="adjust(5)"
        class="flex-1 py-2 bg-bg-elevated hover:bg-neon-cyan/20 text-neon-cyan rounded-lg border border-bg-elevated hover:border-neon-cyan/50 transition"
      >+5</button>
      <button
        @click="adjust(1)"
        class="flex-1 py-2 bg-bg-elevated hover:bg-neon-cyan/20 text-neon-cyan rounded-lg border border-bg-elevated hover:border-neon-cyan/50 transition"
      >+1</button>
    </div>
  </div>
</template>
