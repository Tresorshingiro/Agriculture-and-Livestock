/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        bone:     '#F7F4EC',
        band:     '#EFEADC',
        surface:  '#FFFDF7',
        hairline: '#E0D9C7',
        soil:     '#241C14',
        muted:    '#6E6153',
        gold:     '#C8912F',
        green:    '#3C6B3F',
        clay:     '#9A5B3A',
        onDark:   '#F2EDE1',
      },
      fontFamily: {
        display: ['Fraunces', 'Georgia', 'serif'],
        sans:    ['Inter Tight', 'system-ui', 'sans-serif'],
      },
      borderRadius: { card: '2px' },
      transitionTimingFunction: { editorial: 'cubic-bezier(0.16, 1, 0.3, 1)' },
    },
  },
  plugins: [],
}
