<script setup lang="ts">
import { computed } from 'vue'
import { useMetronomeStore } from '../stores/metronome'
import {
  ALLOWED_NUMERATORS,
  ALLOWED_DENOMINATORS,
  ALLOWED_SUBDIVISIONS,
  reshapeTracks,
  totalSteps,
  downloadPatternAsJson,
} from '../data/patternHelpers'
import type { Pattern } from '../audio/types'

const props = defineProps<{ pattern: Pattern }>()
const metronome = useMetronomeStore()

const stepCount = computed(() => totalSteps(props.pattern.timeSignature[0], props.pattern.subdivision))

/** Highlight grid column for the currently playing step. */
const playingStep = computed(() => {
  if (!metronome.isPlaying) return -1
  if (metronome.currentBeat < 0) return -1
  return metronome.currentBeat * props.pattern.subdivision
})

function cycleStep(trackIdx: number, stepIdx: number): void {
  const cur = props.pattern.tracks[trackIdx].steps[stepIdx] ?? 0
  props.pattern.tracks[trackIdx].steps[stepIdx] = (cur + 1) % 3
}

function setName(e: Event): void {
  props.pattern.name = (e.target as HTMLInputElement).value || 'Untitled'
}

function setNumerator(e: Event): void {
  const num = parseInt((e.target as HTMLSelectElement).value, 10)
  props.pattern.timeSignature = [num, props.pattern.timeSignature[1]]
  props.pattern.tracks = reshapeTracks(props.pattern.tracks, totalSteps(num, props.pattern.subdivision))
}

function setDenominator(e: Event): void {
  const denom = parseInt((e.target as HTMLSelectElement).value, 10)
  props.pattern.timeSignature = [props.pattern.timeSignature[0], denom]
}

function setSubdivision(e: Event): void {
  const sub = parseInt((e.target as HTMLSelectElement).value, 10)
  props.pattern.subdivision = sub
  props.pattern.tracks = reshapeTracks(props.pattern.tracks, totalSteps(props.pattern.timeSignature[0], sub))
}

function onDelete(): void {
  if (!confirm(`Delete "${props.pattern.name}"?`)) return
  metronome.removeCustomPattern(props.pattern.id)
}

function onExport(): void {
  downloadPatternAsJson(props.pattern)
}

const TRACK_LABELS: Record<string, string> = {
  kick: 'Kick',
  snare: 'Snare',
  hihat: 'Hi-Hat',
}

const SUBDIVISION_LABELS: Record<number, string> = {
  1: '1 (♩)',
  2: '2 (♪)',
  3: '3 (triplet)',
  4: '4 (16ᵗʰ)',
}
</script>

<template>
  <div class="flex flex-col gap-4 p-6 bg-bg-panel rounded-2xl border border-bg-elevated">
    <!-- Header -->
    <div class="flex items-center gap-3">
      <input
        :value="pattern.name"
        @input="setName"
        maxlength="40"
        class="flex-1 bg-transparent text-lg font-bold text-neon-pink border-b border-bg-elevated focus:border-neon-pink outline-none px-1 py-1"
      />
      <button
        @click="onExport"
        title="Export as JSON"
        class="px-3 py-1.5 text-sm rounded-lg bg-bg-elevated border border-bg-elevated text-gray-400 hover:text-neon-cyan hover:border-neon-cyan/50 transition"
      >
        ↓ Export
      </button>
      <button
        @click="onDelete"
        title="Delete pattern"
        class="px-3 py-1.5 text-sm rounded-lg bg-bg-elevated border border-bg-elevated text-gray-400 hover:text-red-400 hover:border-red-400/50 transition"
      >
        🗑
      </button>
    </div>

    <!-- Controls -->
    <div class="flex flex-wrap gap-3 text-sm">
      <label class="flex items-center gap-2">
        <span class="text-gray-500 uppercase tracking-wider text-xs">Beats</span>
        <select
          :value="pattern.timeSignature[0]"
          @change="setNumerator"
          class="bg-bg-elevated border border-bg-elevated rounded px-2 py-1 text-neon-cyan outline-none focus:border-neon-cyan"
        >
          <option v-for="n in ALLOWED_NUMERATORS" :key="n" :value="n">{{ n }}</option>
        </select>
      </label>
      <label class="flex items-center gap-2">
        <span class="text-gray-500 uppercase tracking-wider text-xs">/</span>
        <select
          :value="pattern.timeSignature[1]"
          @change="setDenominator"
          class="bg-bg-elevated border border-bg-elevated rounded px-2 py-1 text-neon-cyan outline-none focus:border-neon-cyan"
        >
          <option v-for="d in ALLOWED_DENOMINATORS" :key="d" :value="d">{{ d }}</option>
        </select>
      </label>
      <label class="flex items-center gap-2">
        <span class="text-gray-500 uppercase tracking-wider text-xs">Subdivision</span>
        <select
          :value="pattern.subdivision"
          @change="setSubdivision"
          class="bg-bg-elevated border border-bg-elevated rounded px-2 py-1 text-neon-cyan outline-none focus:border-neon-cyan"
        >
          <option v-for="s in ALLOWED_SUBDIVISIONS" :key="s" :value="s">
            {{ SUBDIVISION_LABELS[s] }}
          </option>
        </select>
      </label>
    </div>

    <!-- Step grid -->
    <div class="overflow-x-auto">
      <div class="inline-flex flex-col gap-2 min-w-full">
        <div v-for="(track, trackIdx) in pattern.tracks" :key="track.sound" class="flex items-center gap-2">
          <div class="w-14 text-xs uppercase tracking-wider text-gray-500 text-right shrink-0">
            {{ TRACK_LABELS[track.sound] ?? track.sound }}
          </div>
          <div class="flex gap-1">
            <template v-for="stepIdx in stepCount" :key="stepIdx">
              <!-- visual gap between beats -->
              <div
                v-if="stepIdx > 1 && (stepIdx - 1) % pattern.subdivision === 0"
                class="w-1"
              ></div>
              <button
                @click="cycleStep(trackIdx, stepIdx - 1)"
                class="w-8 h-8 rounded transition border"
                :class="[
                  track.steps[stepIdx - 1] === 2
                    ? 'bg-neon-pink border-neon-pink'
                    : track.steps[stepIdx - 1] === 1
                      ? 'bg-neon-cyan border-neon-cyan'
                      : 'bg-bg-elevated border-bg-elevated hover:border-neon-cyan/40',
                  playingStep === stepIdx - 1 ? 'ring-2 ring-neon-amber ring-offset-2 ring-offset-bg-panel' : '',
                ]"
              ></button>
            </template>
          </div>
        </div>
      </div>
      <div class="text-xs text-gray-600 mt-3 ml-16">
        Click cell · empty → normal → <span class="text-neon-pink">accent</span> → empty
      </div>
    </div>
  </div>
</template>
