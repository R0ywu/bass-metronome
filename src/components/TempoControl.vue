<script setup lang="ts">
import { ref, computed, watch, onMounted, onBeforeUnmount, onUnmounted } from 'vue'
import { useMetronomeStore, MIN_BPM, MAX_BPM } from '../stores/metronome'

const store = useMetronomeStore()

const SIZE = 280
const CENTER = SIZE / 2
const RADIUS = 118
const STROKE = 14
const ANGLE_MIN = -135
const ANGLE_MAX = 135
const ANGLE_RANGE = ANGLE_MAX - ANGLE_MIN
const BPM_PER_TURN = 100

const knobEl = ref<SVGSVGElement | null>(null)
// Non-reactive scratch state — mutated in event handlers, never read by template.
let dragLastAngle: number | null = null
let dragBpmFloat = 0
let rafId: number | null = null
let pendingBpm: number | null = null

function clampBpm(v: number): number {
  return Math.max(MIN_BPM, Math.min(MAX_BPM, v))
}

const angleDeg = computed(() => {
  const t = (store.bpm - MIN_BPM) / (MAX_BPM - MIN_BPM)
  return ANGLE_MIN + t * ANGLE_RANGE
})

function polar(deg: number, r: number): { x: number; y: number } {
  const rad = ((deg - 90) * Math.PI) / 180
  return { x: CENTER + r * Math.cos(rad), y: CENTER + r * Math.sin(rad) }
}

const trackPath = computed(() => {
  const s = polar(ANGLE_MIN, RADIUS)
  const e = polar(ANGLE_MAX, RADIUS)
  return `M ${s.x} ${s.y} A ${RADIUS} ${RADIUS} 0 1 1 ${e.x} ${e.y}`
})

const arcEnd = computed(() => polar(angleDeg.value, RADIUS))

const arcPath = computed(() => {
  const s = polar(ANGLE_MIN, RADIUS)
  const e = arcEnd.value
  const largeArc = angleDeg.value - ANGLE_MIN > 180 ? 1 : 0
  return `M ${s.x} ${s.y} A ${RADIUS} ${RADIUS} 0 ${largeArc} 1 ${e.x} ${e.y}`
})

const ticks = computed(() =>
  Array.from({ length: 10 }, (_, i) => {
    const deg = ANGLE_MIN + (i / 9) * ANGLE_RANGE
    const inner = polar(deg, RADIUS - STROKE / 2 - 4)
    const outer = polar(deg, RADIUS - STROKE / 2 - 12)
    return { x1: inner.x, y1: inner.y, x2: outer.x, y2: outer.y }
  }),
)

const pulse = ref(false)
let pulseTimer: number | null = null
watch(
  () => store.currentStep,
  (s) => {
    if (s < 0) return
    pulse.value = true
    if (pulseTimer !== null) window.clearTimeout(pulseTimer)
    pulseTimer = window.setTimeout(() => {
      pulse.value = false
    }, 110)
  },
)

function pointerAngle(e: PointerEvent): number {
  const rect = knobEl.value!.getBoundingClientRect()
  const cx = rect.left + rect.width / 2
  const cy = rect.top + rect.height / 2
  return Math.atan2(e.clientY - cy, e.clientX - cx)
}

function onPointerDown(e: PointerEvent): void {
  const target = e.target as Element
  if (target.closest('[data-knob-center]')) return
  e.preventDefault()
  dragLastAngle = pointerAngle(e)
  dragBpmFloat = store.bpm
  knobEl.value!.setPointerCapture(e.pointerId)
}

function onPointerMove(e: PointerEvent): void {
  if (dragLastAngle === null) return
  const cur = pointerAngle(e)
  let delta = cur - dragLastAngle
  // Wrap delta to (-π, π] so crossing the bottom dead-zone stays smooth.
  if (delta > Math.PI) delta -= 2 * Math.PI
  if (delta < -Math.PI) delta += 2 * Math.PI
  // Clamp the float accumulator to BPM range so reverse-drag doesn't have
  // to "catch up" through values past the limits.
  dragBpmFloat = clampBpm(dragBpmFloat + (delta / (2 * Math.PI)) * BPM_PER_TURN)
  dragLastAngle = cur
  // Coalesce high-rate pointer events into one store update per frame.
  pendingBpm = dragBpmFloat
  if (rafId === null) {
    rafId = requestAnimationFrame(() => {
      if (pendingBpm !== null) store.setBpm(pendingBpm)
      pendingBpm = null
      rafId = null
    })
  }
}

function onPointerUp(): void {
  dragLastAngle = null
  if (rafId !== null) {
    cancelAnimationFrame(rafId)
    rafId = null
  }
  if (pendingBpm !== null) {
    store.setBpm(pendingBpm)
    pendingBpm = null
  }
}

function onWheel(e: WheelEvent): void {
  e.preventDefault()
  const dir = e.deltaY > 0 ? -1 : 1
  const step = e.shiftKey ? 5 : 1
  store.setBpm(store.bpm + dir * step)
}

const tapTimes: number[] = []
const TAP_RESET_MS = 2000
const MAX_TAPS = 4

function tap(): void {
  const now = performance.now()
  if (tapTimes.length && now - tapTimes[tapTimes.length - 1] > TAP_RESET_MS) {
    tapTimes.length = 0
  }
  tapTimes.push(now)
  if (tapTimes.length > MAX_TAPS) tapTimes.shift()
  if (tapTimes.length >= 2) {
    const intervals: number[] = []
    for (let i = 1; i < tapTimes.length; i++) {
      intervals.push(tapTimes[i] - tapTimes[i - 1])
    }
    const avgMs = intervals.reduce((a, b) => a + b, 0) / intervals.length
    store.setBpm(60000 / avgMs)
  }
}

function adjust(delta: number): void {
  store.setBpm(store.bpm + delta)
}

function onInput(e: Event): void {
  const v = parseInt((e.target as HTMLInputElement).value, 10)
  if (!isNaN(v)) store.setBpm(v)
}

async function onPlay(): Promise<void> {
  await store.toggle()
}

// Attach wheel manually with passive: false so preventDefault is honored
// across browsers — Vue's @wheel.prevent does not guarantee non-passive.
onMounted(() => {
  knobEl.value?.addEventListener('wheel', onWheel, { passive: false })
})

// Detach the wheel listener while the DOM ref is still valid.
onBeforeUnmount(() => {
  knobEl.value?.removeEventListener('wheel', onWheel)
})

onUnmounted(() => {
  if (pulseTimer !== null) window.clearTimeout(pulseTimer)
  if (rafId !== null) cancelAnimationFrame(rafId)
})
</script>

<template>
  <div class="flex flex-col items-center gap-4 p-6 bg-bg-panel rounded-2xl border border-bg-elevated">
    <div class="text-xs uppercase tracking-widest text-gray-500">Tempo</div>

    <svg
      ref="knobEl"
      :width="SIZE"
      :height="SIZE"
      :viewBox="`0 0 ${SIZE} ${SIZE}`"
      class="touch-none select-none cursor-grab active:cursor-grabbing"
      role="slider"
      :aria-valuemin="MIN_BPM"
      :aria-valuemax="MAX_BPM"
      :aria-valuenow="store.bpm"
      tabindex="0"
      @pointerdown="onPointerDown"
      @pointermove="onPointerMove"
      @pointerup="onPointerUp"
      @pointercancel="onPointerUp"
    >
      <path
        :d="trackPath"
        stroke="rgb(40 44 56)"
        :stroke-width="STROKE"
        fill="none"
        stroke-linecap="round"
      />

      <path
        :d="arcPath"
        :stroke="store.isPlaying ? '#ff00ea' : '#00f0ff'"
        :stroke-width="STROKE"
        fill="none"
        stroke-linecap="round"
        :style="{
          filter: `drop-shadow(0 0 ${pulse ? 14 : 6}px ${store.isPlaying ? '#ff00ea' : '#00f0ff'})`,
          transition: 'filter 0.1s ease-out',
        }"
      />

      <line
        v-for="(t, i) in ticks"
        :key="i"
        :x1="t.x1"
        :y1="t.y1"
        :x2="t.x2"
        :y2="t.y2"
        stroke="rgb(80 90 110)"
        stroke-width="2"
        stroke-linecap="round"
      />

      <circle
        :cx="arcEnd.x"
        :cy="arcEnd.y"
        r="6"
        fill="white"
        :style="{ filter: `drop-shadow(0 0 ${pulse ? 12 : 6}px white)` }"
      />

      <text
        :x="CENTER"
        :y="CENTER - 32"
        text-anchor="middle"
        class="font-bold"
        :class="store.isPlaying ? 'fill-neon-pink' : 'fill-neon-cyan'"
        style="font-size: 40px; text-shadow: 0 0 8px currentColor;"
      >
        {{ store.bpm }}
      </text>
      <text
        :x="CENTER"
        :y="CENTER - 12"
        text-anchor="middle"
        class="fill-gray-500 uppercase"
        style="font-size: 10px; letter-spacing: 0.2em;"
      >
        bpm
      </text>

      <foreignObject :x="CENTER - 38" :y="CENTER + 4" width="76" height="76">
        <button
          data-knob-center
          @click.stop="onPlay"
          @pointerdown.stop
          :aria-label="store.isPlaying ? 'Stop' : 'Play'"
          class="w-[76px] h-[76px] rounded-full flex items-center justify-center text-3xl font-bold transition-all border-2"
          :class="
            store.isPlaying
              ? 'bg-neon-pink/20 border-neon-pink text-neon-pink glow-pink'
              : 'bg-neon-cyan/10 border-neon-cyan text-neon-cyan hover:bg-neon-cyan/20 glow-cyan'
          "
        >
          <span v-if="store.isPlaying">■</span>
          <span v-else>▶</span>
        </button>
      </foreignObject>
    </svg>

    <div class="flex gap-2 w-full max-w-md">
      <button
        @click="adjust(-5)"
        class="flex-1 py-2 bg-bg-elevated hover:bg-neon-cyan/20 text-neon-cyan rounded-lg border border-bg-elevated hover:border-neon-cyan/50 transition"
      >−5</button>
      <button
        @click="adjust(-1)"
        class="flex-1 py-2 bg-bg-elevated hover:bg-neon-cyan/20 text-neon-cyan rounded-lg border border-bg-elevated hover:border-neon-cyan/50 transition"
      >−1</button>
      <button
        @click="tap"
        class="flex-[2] py-2 bg-neon-pink/10 hover:bg-neon-pink/30 text-neon-pink rounded-lg border border-neon-pink/40 transition font-bold"
      >TAP</button>
      <button
        @click="adjust(1)"
        class="flex-1 py-2 bg-bg-elevated hover:bg-neon-cyan/20 text-neon-cyan rounded-lg border border-bg-elevated hover:border-neon-cyan/50 transition"
      >+1</button>
      <button
        @click="adjust(5)"
        class="flex-1 py-2 bg-bg-elevated hover:bg-neon-cyan/20 text-neon-cyan rounded-lg border border-bg-elevated hover:border-neon-cyan/50 transition"
      >+5</button>
    </div>

    <label class="flex items-center gap-2 text-xs text-gray-500 uppercase tracking-wider">
      <span>Set</span>
      <input
        type="number"
        :value="store.bpm"
        :min="MIN_BPM"
        :max="MAX_BPM"
        @input="onInput"
        class="w-20 bg-bg-elevated border border-bg-elevated rounded px-2 py-1 text-neon-cyan text-center outline-none focus:border-neon-cyan [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
      />
      <span>bpm</span>
    </label>

    <div class="text-[11px] text-gray-600 text-center tracking-wide">
      Drag the dial · Scroll to fine-tune · Tap center to play
    </div>
  </div>
</template>
