/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        neon: {
          cyan: '#00f0ff',
          pink: '#ff00ea',
          green: '#00ff88',
          amber: '#ffaa00',
        },
        bg: {
          base: '#0a0a0f',
          panel: '#13131a',
          elevated: '#1c1c26',
        },
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Menlo', 'Monaco', 'monospace'],
      },
      animation: {
        'pulse-fast': 'pulse 0.15s ease-in-out',
      },
    },
  },
  plugins: [],
}
