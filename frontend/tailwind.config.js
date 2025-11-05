/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))'
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))'
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))'
        },
        border: 'hsl(var(--border))',
        // Aliases ness (compatibilidade)
        'ness-blue': 'hsl(var(--primary))',
        'ness-dark': 'hsl(var(--background))',
        'ness-surface': 'hsl(var(--card))',
        'ness-elevated': 'hsl(var(--muted))',
        'ness-border': 'hsl(var(--border))',
        'ness-text': 'hsl(var(--foreground))',
        'ness-muted': 'hsl(var(--muted-foreground))',
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)'
      },
      fontFamily: {
        sans: ['Montserrat', 'system-ui', 'sans-serif'],
      },
      spacing: {
        'grid-xs': 'var(--grid-gap-xs)',
        'grid-sm': 'var(--grid-gap-sm)',
        'grid-md': 'var(--grid-gap-md)',
        'grid-lg': 'var(--grid-gap-lg)',
        'grid-xl': 'var(--grid-gap-xl)',
        'grid-2xl': 'var(--grid-gap-2xl)',
      },
      transitionTimingFunction: {
        'elegant': 'cubic-bezier(0.2, 0.8, 0.2, 1)',
      },
      transitionDuration: {
        'fast': '120ms',
        'base': '200ms',
        'slow': '300ms',
      },
      boxShadow: {
        'elegant': '0 4px 16px rgba(0, 0, 0, 0.1)',
        'elegant-hover': '0 8px 24px rgba(0, 0, 0, 0.2)',
      },
    },
  },
  plugins: [],
}
