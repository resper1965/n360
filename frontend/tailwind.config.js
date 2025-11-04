/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        'ness-blue': '#00ADE8',
        'ness-dark': '#0B0C0E',
        'ness-surface': '#111317',
        'ness-elevated': '#151820',
        'ness-border': '#1B2030',
        'ness-text': '#EEF1F6',
        'ness-muted': '#8B92A8',
      },
      fontFamily: {
        sans: ['Montserrat', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
