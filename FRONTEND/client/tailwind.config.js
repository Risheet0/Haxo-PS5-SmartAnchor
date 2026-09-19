/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        // Light Minimal Stage Surface Colors
        stage: {
          bg: '#F8FAFC',          // Clean light slate-50 background
          surface: '#FFFFFF',     // Pure white cards & panels
          surfaceHover: '#F1F5F9',// Hover background
          surfaceRaised: '#FFFFFF',// Raised surfaces / modals
          border: '#E2E8F0',      // Crisp light border
          borderSubtle: '#F1F5F9',// Sub-dividers
          borderActive: '#CBD5E1',// Active border
        },
        // Refined Functional Accents
        live: {
          DEFAULT: '#DC2626',
          bg: '#FEF2F2',
          border: '#FECACA',
          text: '#DC2626',
          solid: '#DC2626',
          solidHover: '#B91C1C'
        },
        success: {
          DEFAULT: '#059669',
          bg: '#ECFDF5',
          border: '#A7F3D0',
          text: '#059669',
          solid: '#059669',
          solidHover: '#047857'
        },
        warning: {
          DEFAULT: '#D97706',
          bg: '#FFFBEB',
          border: '#FDE68A',
          text: '#D97706',
          solid: '#D97706',
          solidHover: '#B45309'
        },
        info: {
          DEFAULT: '#2563EB',
          bg: '#EFF6FF',
          border: '#BFDBFE',
          text: '#2563EB',
          solid: '#2563EB',
          solidHover: '#1D4ED8'
        },
        ai: {
          DEFAULT: '#4F46E5',
          bg: '#EEF2FF',
          border: '#C7D2FE',
          text: '#4F46E5',
          solid: '#4F46E5',
          solidHover: '#4338CA'
        },
        neutral: {
          50: '#F8FAFC',
          100: '#F1F5F9',
          200: '#E2E8F0',
          300: '#CBD5E1',
          400: '#94A3B8',
          500: '#64748B',
          600: '#475569',
          700: '#334155',
          800: '#1E293B',
          900: '#0F172A',
          950: '#020617',
        }
      },
      borderRadius: {
        'sm': '6px',
        DEFAULT: '8px',
        'md': '10px',
        'lg': '12px',
        'xl': '16px',
        '2xl': '20px',
      },
      boxShadow: {
        'panel': '0 1px 3px 0 rgba(15, 23, 42, 0.06), 0 1px 2px -1px rgba(15, 23, 42, 0.04)',
        'modal': '0 20px 25px -5px rgba(15, 23, 42, 0.1), 0 8px 10px -6px rgba(15, 23, 42, 0.06)',
        'focus-indigo': '0 0 0 2px #FFFFFF, 0 0 0 4px #4F46E5',
        'focus-live': '0 0 0 2px #FFFFFF, 0 0 0 4px #DC2626',
      },
      animation: {
        'pulse-subtle': 'pulse-subtle 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'live-ping': 'live-ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite',
      },
      keyframes: {
        'pulse-subtle': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' },
        },
        'live-ping': {
          '75%, 100%': { transform: 'scale(2)', opacity: '0' },
        }
      }
    },
  },
  plugins: [],
}

