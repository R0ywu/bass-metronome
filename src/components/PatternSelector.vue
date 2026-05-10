<script setup lang="ts">
import { useMetronomeStore } from '../stores/metronome'
import { STATIC_PATTERNS } from '../data/presetPatterns'

const store = useMetronomeStore()

const allPatterns = [
  { id: 'click', name: 'Click' },
  ...STATIC_PATTERNS.map((p) => ({ id: p.id, name: p.name })),
]

function isActive(id: string): boolean {
  return store.currentPatternId === id
}

function select(id: string): void {
  store.selectPattern(id)
}
</script>

<template>
  <div class="flex flex-col items-center gap-3 p-6 bg-bg-panel rounded-2xl border border-bg-elevated">
    <div class="text-xs uppercase tracking-widest text-gray-500">Pattern</div>
    <div class="grid grid-cols-2 sm:grid-cols-3 gap-2 w-full">
      <button
        v-for="p in allPatterns"
        :key="p.id"
        @click="select(p.id)"
        class="px-3 py-2 rounded-lg border transition text-sm font-bold"
        :class="
          isActive(p.id)
            ? 'bg-neon-amber/20 border-neon-amber text-neon-amber'
            : 'bg-bg-elevated border-bg-elevated text-gray-400 hover:border-neon-amber/40 hover:text-neon-amber'
        "
      >
        {{ p.name }}
      </button>
    </div>
  </div>
</template>
