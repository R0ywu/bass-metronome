<script setup lang="ts">
import { useMetronomeStore } from '../stores/metronome'
import { useCustomPatternStore } from '../stores/customPatterns'
import { STATIC_PATTERNS } from '../data/presetPatterns'
import { readPatternFromFile } from '../data/patternHelpers'

const store = useMetronomeStore()
const customStore = useCustomPatternStore()

const presets = [
  { id: 'click', name: 'Click' },
  ...STATIC_PATTERNS.map((p) => ({ id: p.id, name: p.name })),
]

function isActive(id: string): boolean {
  return store.currentPatternId === id
}

function select(id: string): void {
  store.selectPattern(id)
}

function createNew(): void {
  const p = customStore.create()
  store.selectPattern(p.id)
}

async function onImport(e: Event): Promise<void> {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  const pattern = await readPatternFromFile(file)
  input.value = '' // allow re-selecting the same file
  if (!pattern) {
    alert('Invalid pattern file')
    return
  }
  customStore.add(pattern)
  store.selectPattern(pattern.id)
}
</script>

<template>
  <div class="flex flex-col gap-4 p-6 bg-bg-panel rounded-2xl border border-bg-elevated">
    <!-- Presets -->
    <div>
      <div class="text-xs uppercase tracking-widest text-gray-500 mb-3">Preset</div>
      <div class="grid grid-cols-2 sm:grid-cols-3 gap-2">
        <button
          v-for="p in presets"
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

    <!-- Custom -->
    <div>
      <div class="text-xs uppercase tracking-widest text-gray-500 mb-3">Custom</div>
      <div class="grid grid-cols-2 sm:grid-cols-3 gap-2">
        <button
          v-for="p in customStore.patterns"
          :key="p.id"
          @click="select(p.id)"
          class="px-3 py-2 rounded-lg border transition text-sm font-bold truncate"
          :class="
            isActive(p.id)
              ? 'bg-neon-pink/20 border-neon-pink text-neon-pink'
              : 'bg-bg-elevated border-bg-elevated text-gray-400 hover:border-neon-pink/40 hover:text-neon-pink'
          "
        >
          {{ p.name }}
        </button>
        <button
          @click="createNew"
          class="px-3 py-2 rounded-lg border border-dashed border-gray-600 text-gray-400 hover:border-neon-pink hover:text-neon-pink transition text-sm font-bold"
        >
          + New
        </button>
        <label
          class="px-3 py-2 rounded-lg border border-dashed border-gray-600 text-gray-400 hover:border-neon-pink hover:text-neon-pink transition text-sm font-bold cursor-pointer text-center"
        >
          ↑ Import
          <input type="file" accept="application/json,.json" @change="onImport" class="hidden" />
        </label>
      </div>
    </div>
  </div>
</template>
