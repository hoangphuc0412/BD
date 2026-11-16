/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#12050d',
        plum: '#1e0916',
        wine: '#6b1735',
        wineDeep: '#3d0c1f',
        blush: '#f3c3d1',
        rose: '#e58aa9',
        pearl: '#fbf3ec',
        champagne: '#e3c297',
        gold: '#c9a36a',
      },
      fontFamily: {
        serif: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        script: ['"Great Vibes"', 'cursive'],
        sans: ['Raleway', 'system-ui', 'sans-serif'],
      },
      letterSpacing: {
        widest2: '0.42em',
      },
      transitionTimingFunction: {
        silk: 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
    },
  },
  plugins: [],
}
