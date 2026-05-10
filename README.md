# bass-metronome

[![Deploy](https://github.com/R0ywu/bass-metronome/actions/workflows/deploy.yml/badge.svg)](https://github.com/R0ywu/bass-metronome/actions/workflows/deploy.yml)
[![Version](https://img.shields.io/github/v/tag/R0ywu/bass-metronome?label=version)](https://github.com/R0ywu/bass-metronome/tags)
[![License: MIT](https://img.shields.io/github/license/R0ywu/bass-metronome)](LICENSE)

![Vue](https://img.shields.io/badge/Vue-3-4FC08D?logo=vue.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-6-3178C6?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white)
![Pinia](https://img.shields.io/badge/Pinia-3-FFD859?logo=pinia&logoColor=black)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-3-06B6D4?logo=tailwindcss&logoColor=white)

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

## License

[MIT](LICENSE) © roywu
