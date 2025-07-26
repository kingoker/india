module.exports = {
  content: [
    './app.vue',
    './app/**/*.{vue,js,ts}',
    './components/**/*.{vue,js,ts}',
    './layouts/**/*.{vue,js,ts}',
    './composables/**/*.{js,ts}',
    './utils/**/*.{js,ts}'
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          light: '#7dd3fc',
          DEFAULT: '#0ea5e9',
          dark: '#0369a1',
  },
        secondary: {
          light: '#fef08a',
          DEFAULT: '#f59e42',
          dark: '#b45309',
        },
        background: '#18181b',
        surface: '#27272a',
        backgroundMain: '#FFFCF5',
      },
      fontFamily: {
        montserrat: ['Montserrat', 'sans-serif'],
        alice: ['Alice', 'serif'],
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
    require('@tailwindcss/line-clamp'),
  ],
}
