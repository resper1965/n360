/** @type {import('tailwindcss').Config} */
/** 🎨 ness. Design System - "Invisible Elegance" */
export default {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      /* 🎨 Refined colors */
      colors: {
        // Shadcn Base
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))'
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
          100: 'hsl(var(--primary-100))',
          200: 'hsl(var(--primary-200))',
          300: 'hsl(var(--primary-300))',
          400: 'hsl(var(--primary-400))',
          500: 'hsl(var(--primary-500))',
          600: 'hsl(var(--primary-600))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))'
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',

        // Refined slate palette
        slate: {
          950: 'hsl(var(--slate-950))',
          900: 'hsl(var(--slate-900))',
          850: 'hsl(var(--slate-850))',
          800: 'hsl(var(--slate-800))',
          700: 'hsl(var(--slate-700))',
          600: 'hsl(var(--slate-600))',
          500: 'hsl(var(--slate-500))',
          400: 'hsl(var(--slate-400))',
          300: 'hsl(var(--slate-300))',
          200: 'hsl(var(--slate-200))',
          100: 'hsl(var(--slate-100))',
        },

        // ness. aliases (compatibility)
        'ness-blue': 'hsl(var(--primary-500))',
        'ness-dark': 'hsl(var(--slate-950))',
        'ness-surface': 'hsl(var(--slate-850))',
        'ness-elevated': 'hsl(var(--slate-800))',
        'ness-border': 'hsl(var(--slate-700))',
        'ness-text': 'hsl(var(--slate-200))',
        'ness-muted': 'hsl(var(--slate-400))',
      },

      /* ✍️ Typography */
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
        display: ['Montserrat', 'Inter', 'sans-serif'],
      },
      fontSize: {
        '6xl': ['var(--text-6xl)', { lineHeight: 'var(--leading-none)' }],
        '5xl': ['var(--text-5xl)', { lineHeight: 'var(--leading-tight)' }],
        '4xl': ['var(--text-4xl)', { lineHeight: 'var(--leading-tight)' }],
        '3xl': ['var(--text-3xl)', { lineHeight: 'var(--leading-snug)' }],
        '2xl': ['var(--text-2xl)', { lineHeight: 'var(--leading-snug)' }],
        'xl': ['var(--text-xl)', { lineHeight: 'var(--leading-normal)' }],
        'lg': ['var(--text-lg)', { lineHeight: 'var(--leading-relaxed)' }],
        'base': ['var(--text-base)', { lineHeight: 'var(--leading-normal)' }],
        'sm': ['var(--text-sm)', { lineHeight: 'var(--leading-normal)' }],
        'xs': ['var(--text-xs)', { lineHeight: 'var(--leading-normal)' }],
      },
      fontWeight: {
        light: 'var(--font-light)',
        normal: 'var(--font-normal)',
        medium: 'var(--font-medium)',
        semibold: 'var(--font-semibold)',
        bold: 'var(--font-bold)',
      },
      lineHeight: {
        none: 'var(--leading-none)',
        tight: 'var(--leading-tight)',
        snug: 'var(--leading-snug)',
        normal: 'var(--leading-normal)',
        relaxed: 'var(--leading-relaxed)',
        loose: 'var(--leading-loose)',
      },

      /* 📏 Spacing (4px scale) */
      spacing: {
        '1': 'var(--space-1)',
        '2': 'var(--space-2)',
        '3': 'var(--space-3)',
        '4': 'var(--space-4)',
        '5': 'var(--space-5)',
        '6': 'var(--space-6)',
        '8': 'var(--space-8)',
        '10': 'var(--space-10)',
        '12': 'var(--space-12)',
        '16': 'var(--space-16)',
        '20': 'var(--space-20)',
        '24': 'var(--space-24)',
        '32': 'var(--space-32)',
        'grid-xs': 'var(--grid-gap-xs)',
        'grid-sm': 'var(--grid-gap-sm)',
        'grid-md': 'var(--grid-gap-md)',
        'grid-lg': 'var(--grid-gap-lg)',
        'grid-xl': 'var(--grid-gap-xl)',
        'grid-2xl': 'var(--grid-gap-2xl)',
      },

      /* 🎨 Border radius */
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)'
      },

      /* 🎭 Subtle transitions */
      transitionTimingFunction: {
        'elegant': 'cubic-bezier(0.2, 0.8, 0.2, 1)',
      },
      transitionDuration: {
        'fast': 'var(--transition-fast)',
        'base': 'var(--transition-base)',
        'slow': 'var(--transition-slow)',
      },

      /* 🌑 Elegant shadows */
      boxShadow: {
        'elegant': '0 4px 16px rgba(0, 0, 0, 0.15)',
        'elegant-hover': '0 8px 24px rgba(0, 0, 0, 0.3), 0 0 0 1px hsl(var(--primary-500) / 0.1)',
        'invisible': '0 2px 8px rgba(0, 0, 0, 0.08)',
        'present': '0 12px 32px rgba(0, 173, 232, 0.15)',
      },
    },
  },
  plugins: [],
}
