<script setup lang="ts">
import { useMetronomeStore } from '../stores/metronome'

const store = useMetronomeStore()

async function onClick(): Promise<void> {
  await store.toggle()
}
</script>

<template>
  <button
    @click="onClick"
    class="w-24 h-24 rounded-full flex items-center justify-center text-3xl font-bold transition-all duration-150 border-2"
    :class="
      store.isPlaying
        ? 'bg-neon-pink/20 border-neon-pink text-neon-pink glow-pink'
        : 'bg-neon-cyan/10 border-neon-cyan text-neon-cyan hover:bg-neon-cyan/20 glow-cyan'
    "
    :aria-label="store.isPlaying ? 'Stop' : 'Play'"
  >
    <span v-if="store.isPlaying">■</span>
    <span v-else>▶</span>
  </button>
</template>
