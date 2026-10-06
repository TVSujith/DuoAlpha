/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#07080A',
        surface: {
          DEFAULT: '#0E1015',
          light: '#141822',
          border: '#1E2330'
        },
        trade: {
          green: '#00E676',
          greenGlow: 'rgba(0, 230, 118, 0.25)',
          cyan: '#00E5FF',
          cyanGlow: 'rgba(0, 229, 255, 0.25)',
          red: '#FF4560',
          redGlow: 'rgba(255, 69, 96, 0.25)',
          muted: '#8A92A6'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace']
      },
      boxShadow: {
        'glow-green': '0 0 20px rgba(0, 230, 118, 0.35)',
        'glow-cyan': '0 0 20px rgba(0, 229, 255, 0.35)',
        'glow-red': '0 0 20px rgba(255, 69, 96, 0.35)',
        'card': '0 4px 24px -1px rgba(0, 0, 0, 0.6)'
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
}
