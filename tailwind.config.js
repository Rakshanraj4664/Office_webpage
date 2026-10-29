/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        canvas: '#F5F4EF',
        surface: '#FFFFFF',
        subtle: '#EAE8E0',
        obsidian: '#101216',
        obsidianCard: '#171A20',
        ink: {
          DEFAULT: '#111317',
          secondary: '#4A4F5A',
          muted: '#727885',
          onDark: '#F6F5F0',
          onDarkMuted: '#9BA2B0'
        },
        line: {
          light: '#DFDDD4',
          mid: '#C6C3B7',
          dark: '#262B35'
        },
        volt: {
          DEFAULT: '#DF4B18',
          hover: '#C23C0E',
          bright: '#FF6B35',
          soft: 'rgba(223, 75, 24, 0.10)',
          glow: 'rgba(223, 75, 24, 0.35)'
        },
        emeraldBrand: '#18794E'
      },
      fontFamily: {
        display: [
          'Archivo',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Helvetica Neue',
          'Arial',
          'sans-serif'
        ],
        sans: [
          'IBM Plex Sans',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'Helvetica Neue',
          'Arial',
          'sans-serif'
        ]
      },
      maxWidth: {
        shell: '1200px'
      },
      boxShadow: {
        editorial: '0 18px 44px -18px rgba(17, 19, 23, 0.12)',
        card: '0 8px 26px -12px rgba(17, 19, 23, 0.08)',
        voltGlow: '0 8px 24px -6px rgba(223, 75, 24, 0.42)'
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translate3d(0, 0, 0)' },
          '100%': { transform: 'translate3d(-50%, 0, 0)' }
        },
        pulseDot: {
          '0%, 100%': { transform: 'scale(1)', opacity: '1' },
          '50%': { transform: 'scale(1.45)', opacity: '0.55' }
        },
        waveBar: {
          '0%, 100%': { transform: 'scaleY(0.35)' },
          '50%': { transform: 'scaleY(1)' }
        }
      },
      animation: {
        marquee: 'marquee 30s linear infinite',
        pulseDot: 'pulseDot 2s ease-in-out infinite',
        waveBar: 'waveBar 1.1s ease-in-out infinite'
      }
    }
  },
  plugins: []
};
