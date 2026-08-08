/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: '#04070c',
        surface: {
          50: '#1a2234',
          100: '#121927',
          200: '#0c121e',
          300: '#080d17',
          400: '#04070c',
        },
        brand: {
          green: '#00ff41',
          lime: '#10f543',
          neon: '#00ff66',
          cyan: '#06b6d4',
          violet: '#8b5cf6',
          fuchsia: '#d946ef',
          amber: '#f59e0b',
          rose: '#f43f5e',
        }
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
        pixel: ['"Press Start 2P"', 'monospace'],
        arcade: ['Orbitron', 'sans-serif'],
        cyber: ['Chakra Petch', 'sans-serif'],
      },
      boxShadow: {
        'glow-green': '0 0 30px 2px rgba(0, 255, 65, 0.55)',
        'glow-cyan': '0 0 30px 2px rgba(6, 182, 212, 0.55)',
        'glow-violet': '0 0 30px 2px rgba(139, 92, 246, 0.55)',
        'glow-fuchsia': '0 0 30px 2px rgba(217, 70, 239, 0.55)',
        'glow-amber': '0 0 30px 2px rgba(245, 158, 11, 0.55)',
        'retro-neon': '0 0 15px #00ff41, inset 0 0 15px rgba(0, 255, 65, 0.2)',
        'retro-magenta': '0 0 15px #d946ef, inset 0 0 15px rgba(217, 70, 239, 0.2)',
        'retro-cyan': '0 0 15px #06b6d4, inset 0 0 15px rgba(6, 182, 212, 0.2)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 4s ease-in-out infinite',
        'glow-green': 'glowGreen 2s ease-in-out infinite alternate',
        'spin-slow': 'spin 12s linear infinite',
        'scanline': 'scanline 8s linear infinite',
        'flicker': 'flicker 0.15s infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        glowGreen: {
          '0%': { boxShadow: '0 0 15px rgba(0, 255, 65, 0.3)' },
          '100%': { boxShadow: '0 0 35px rgba(0, 255, 65, 0.8)' }
        },
        scanline: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(1000%)' }
        }
      }
    },
  },
  plugins: [],
}
