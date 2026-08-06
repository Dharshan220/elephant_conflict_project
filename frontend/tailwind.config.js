/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['Space Grotesk', 'Inter', 'sans-serif'],
      },
      colors: {
        bg: 'var(--c-bg)',
        surface: 'var(--c-surface)',
        panel: 'var(--c-panel)',
        panelHover: 'var(--c-panel-hover)',
        glass: 'var(--c-glass)',
        line: 'var(--c-line)',
        ink: 'var(--c-ink)',
        muted: 'var(--c-muted)',
        faint: 'var(--c-faint)',
        accent: {
          DEFAULT: '#22c55e',
          soft: 'var(--c-accent-soft)',
        },
        danger: {
          DEFAULT: '#e5484d',
          soft: 'rgba(229,72,77,0.14)',
        },
        warning: {
          DEFAULT: '#f5a623',
          soft: 'rgba(245,166,35,0.14)',
        },
        info: {
          DEFAULT: '#3b82f6',
          soft: 'rgba(59,130,246,0.14)',
        },
        success: {
          DEFAULT: '#22c55e',
          soft: 'rgba(34,197,94,0.14)',
        },
        forest: {
          50: '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
          800: '#065f46',
          900: '#064e3b',
        },
      },
      backgroundImage: {
        'hero-glow':
          'radial-gradient(1200px 600px at 70% -10%, rgba(16,185,129,0.18), transparent 60%), radial-gradient(900px 500px at 10% 110%, rgba(3,105,161,0.14), transparent 55%)',
      },
      boxShadow: {
        card: '0 1px 0 rgba(255,255,255,0.04) inset, 0 8px 32px rgba(0,0,0,0.35)',
        glow: '0 0 24px rgba(16,185,129,0.35)',
        'glow-danger': '0 0 24px rgba(229,72,77,0.4)',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-600px 0' },
          '100%': { backgroundPosition: '600px 0' },
        },
        scan: {
          '0%': { top: '0%', opacity: '0' },
          '10%': { opacity: '1' },
          '90%': { opacity: '1' },
          '100%': { top: '100%', opacity: '0' },
        },
        pulseRing: {
          '0%': { transform: 'scale(0.8)', opacity: '0.8' },
          '100%': { transform: 'scale(2.4)', opacity: '0' },
        },
        blink: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.25' },
        },
        floatSlow: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        },
      },
      animation: {
        shimmer: 'shimmer 1.6s linear infinite',
        scan: 'scan 3.5s ease-in-out infinite',
        pulseRing: 'pulseRing 2.2s cubic-bezier(0.4,0,0.2,1) infinite',
        blink: 'blink 1.4s ease-in-out infinite',
        floatSlow: 'floatSlow 5s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}