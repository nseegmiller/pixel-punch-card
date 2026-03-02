/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    fontSize: {
      'xs':   ['2rem',   { lineHeight: '1.4' }],
      'sm':   ['2rem',   { lineHeight: '1.4' }],
      'base': ['2rem',   { lineHeight: '1.4' }],
      'lg':   ['2.25rem',{ lineHeight: '1.4' }],
      'xl':   ['2.5rem', { lineHeight: '1.3' }],
      '2xl':  ['2.5rem', { lineHeight: '1.3' }],
      '3xl':  ['3rem',   { lineHeight: '1.2' }],
      '4xl':  ['3rem',   { lineHeight: '1.2' }],
      '5xl':  ['3rem',   { lineHeight: '1.1' }],
      '6xl':  ['3.5rem', { lineHeight: '1'   }],
    },
    extend: {
      fontFamily: {
        arcade: ['FSPixelSans', 'monospace'],
      },
      colors: {
        ui: {
          bg:        '#3e4350',
          surface:   '#312234',
          raised:    '#40364a',
          border:    '#5b596d',
          muted:     '#7c8497',
          secondary: '#9daec0',
          primary:   '#f8e6d0',
        },
        punch: {
          primary: '#5c79a6',
          hover:   '#8bc0ca',
          success: '#5e8c51',
        },
        danger: {
          DEFAULT: '#a23c3c',
          hover:   '#b45e4e',
        },
      },
      animation: {
        'celebration': 'celebration 0.6s ease-in-out',
        'punch': 'punch 0.3s ease-out',
      },
      keyframes: {
        celebration: {
          '0%, 100%': { transform: 'scale(1)' },
          '25%':  { transform: 'scale(1.1) rotate(5deg)' },
          '50%':  { transform: 'scale(1.2)' },
          '75%':  { transform: 'scale(1.1) rotate(-5deg)' },
        },
        punch: {
          '0%':   { transform: 'scale(1)' },
          '50%':  { transform: 'scale(0.9)' },
          '100%': { transform: 'scale(1)' },
        }
      }
    },
  },
  plugins: [],
}
