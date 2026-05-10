# bass-metronome

A pattern-driven metronome for bass practice on Mac, built with Vue 3 + Vite.

🎵 **Live demo**: https://r0ywu.github.io/bass-metronome/

Plain "click-click-click" gets boring fast and trains you to lock onto a single attack point. Real songs ride on top of a drum groove — so this metronome plays drum patterns (kick / snare / hi-hat) instead of bare clicks. Same idea as practicing with a drum machine, but lightweight and runs in the browser.

## Features

- **Preset patterns**: Click, Rock 8 Beat, Rock 16 Beat, Bossa Nova, Swing, Waltz 3/4
- **Custom patterns**: per-track step editor (kick / snare / hi-hat) with 4-level intensity (mute / weak / medium / strong)
- **Time signature**: configurable numerator (2–7) and denominator (4 or 8)
- **Subdivision**: 1 (♩), 2 (♪), 3 (triplet), 4 (16ᵗʰ), 6 (sextuplet)
- **BPM control**: with keyboard shortcuts
- **Synthesized drum sounds**: pure Web Audio, no samples to load
- **Beat indicator**: visual feedback synced to audio

## Keyboard shortcuts

| Key | Action |
| --- | --- |
| `Space` | Play / stop |
| `↑` / `↓` | BPM ±1 |
| `Shift + ↑` / `Shift + ↓` | BPM ±5 |

## Getting started

```bash
npm install
npm run dev
```

Build for production:

```bash
npm run build
```

## Tech stack

- Vue 3 (`<script setup>` + Composition API)
- TypeScript
- Vite
- Pinia
- Tailwind CSS
- Web Audio API (synthesized drum sounds + look-ahead scheduler)

## Project structure

```
src/
├── audio/        # Web Audio engine, scheduler, sound bank
├── components/   # BpmControl, PatternSelector, StepEditor, BeatIndicator, …
├── data/         # Preset patterns
├── stores/       # Pinia stores (metronome state, custom patterns)
└── App.vue
```
