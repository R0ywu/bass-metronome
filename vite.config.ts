import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  // Production build is served from https://<user>.github.io/bass-metronome/.
  // Dev server keeps '/' so localhost URLs stay unchanged.
  base: command === 'build' ? '/bass-metronome/' : '/',
  plugins: [vue()],
}))
