<script setup lang="ts">
import { computed } from 'vue'
import { useMetronomeStore } from '../stores/metronome'

const store = useMetronomeStore()

const beats = computed(() => {
  return Array.from({ length: store.beatsPerBar }, (_, i) => i)
})

function isActive(beatIdx: number): boolean {
  return store.isPlaying && store.currentBeat === beatIdx
}

function isAccent(beatIdx: number): boolean {
  return beatIdx === 0
}
</script>

<template>
  <div class="flex flex-col items-center gap-3 p-6 bg-bg-panel rounded-2xl border border-bg-elevated min-w-[260px]">
    <div class="text-xs uppercase tracking-widest text-gray-500">Beats</div>
    <div class="flex gap-3 items-end justify-center">
      <div
        v-for="beat in beats"
        :key="beat"
        class="rounded-full transition-all duration-75"
        :class="[
          isAccent(beat) ? 'w-8 h-8' : 'w-6 h-6',
          isActive(beat)
            ? isAccent(beat)
              ? 'bg-neon-pink glow-pink'
              : 'bg-neon-cyan glow-cyan'
            : isAccent(beat)
              ? 'bg-neon-pink/20 border-2 border-neon-pink/40'
              : 'bg-neon-cyan/10 border-2 border-neon-cyan/30',
        ]"
      ></div>
    </div>
  </div>
</template>
