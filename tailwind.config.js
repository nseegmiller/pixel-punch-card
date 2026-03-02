/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
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
        modal: {
          bg:    '#f8e6d0',
          text:  '#3e4350',
          hover: '#dcbaa0',
          muted: '#5b596d',
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
