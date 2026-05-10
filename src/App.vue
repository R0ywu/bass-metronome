<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import { useMetronomeStore } from './stores/metronome'
import BpmControl from './components/BpmControl.vue'
import TimeSignature from './components/TimeSignature.vue'
import PatternSelector from './components/PatternSelector.vue'
import PlayButton from './components/PlayButton.vue'
import BeatIndicator from './components/BeatIndicator.vue'

const store = useMetronomeStore()

// Keyboard shortcuts: Space = play/stop, ↑/↓ = ±1 BPM, Shift+↑/↓ = ±5
function onKeydown(e: KeyboardEvent): void {
  if (e.target instanceof HTMLInputElement) return
  switch (e.code) {
    case 'Space':
      e.preventDefault()
      store.toggle()
      break
    case 'ArrowUp':
      e.preventDefault()
      store.setBpm(store.bpm + (e.shiftKey ? 5 : 1))
      break
    case 'ArrowDown':
      e.preventDefault()
      store.setBpm(store.bpm - (e.shiftKey ? 5 : 1))
      break
  }
}

onMounted(() => window.addEventListener('keydown', onKeydown))
onUnmounted(() => window.removeEventListener('keydown', onKeydown))
</script>

<template>
  <div class="min-h-screen flex flex-col items-center justify-center p-6 bg-bg-base">
    <div class="w-full max-w-2xl space-y-6">
      <header class="text-center mb-4">
        <h1 class="text-3xl font-bold text-neon-cyan text-glow-cyan tracking-widest">
          METRONOME
        </h1>
        <p class="text-xs text-gray-500 uppercase tracking-wider mt-2">
          Phase 2 · Drum Patterns
        </p>
      </header>

      <BpmControl />

      <PatternSelector />

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
        <TimeSignature />
        <BeatIndicator />
      </div>

      <div class="flex justify-center pt-4">
        <PlayButton />
      </div>

      <footer class="text-center text-xs text-gray-600 pt-6 space-y-1">
        <div>SPACE · play / stop</div>
        <div>↑ ↓ · adjust bpm (hold SHIFT for ±5)</div>
      </footer>
    </div>
  </div>
</template>
