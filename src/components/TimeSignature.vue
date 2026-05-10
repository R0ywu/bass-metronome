<script setup lang="ts">
import { useMetronomeStore, type TimeSignature } from '../stores/metronome'

const store = useMetronomeStore()

const presets: TimeSignature[] = [
  [2, 4],
  [3, 4],
  [4, 4],
  [6, 8],
  [7, 8],
]

function isActive(sig: TimeSignature): boolean {
  return store.timeSignature[0] === sig[0] && store.timeSignature[1] === sig[1]
}

function select(sig: TimeSignature): void {
  store.setTimeSignature(sig)
}
</script>

<template>
  <div class="flex flex-col items-center gap-3 p-6 bg-bg-panel rounded-2xl border border-bg-elevated">
    <div class="text-xs uppercase tracking-widest text-gray-500">Time Signature</div>
    <div class="flex flex-wrap gap-2 justify-center">
      <button
        v-for="sig in presets"
        :key="`${sig[0]}/${sig[1]}`"
        @click="select(sig)"
        class="px-4 py-2 rounded-lg border transition font-bold"
        :class="
          isActive(sig)
            ? 'bg-neon-green/20 border-neon-green text-neon-green glow-green'
            : 'bg-bg-elevated border-bg-elevated text-gray-400 hover:border-neon-green/40 hover:text-neon-green'
        "
      >
        {{ sig[0] }}/{{ sig[1] }}
      </button>
    </div>
  </div>
</template>
