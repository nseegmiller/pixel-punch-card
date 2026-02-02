/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        punch: {
          primary: '#4f46e5',   // indigo-600
          success: '#10b981',   // emerald-500
        }
      },
      animation: {
        'celebration': 'celebration 0.6s ease-in-out',
        'punch': 'punch 0.3s ease-out',
      },
      keyframes: {
        celebration: {
          '0%, 100%': { transform: 'scale(1)' },
          '25%': { transform: 'scale(1.1) rotate(5deg)' },
          '50%': { transform: 'scale(1.2)' },
          '75%': { transform: 'scale(1.1) rotate(-5deg)' },
        },
        punch: {
          '0%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(0.9)' },
          '100%': { transform: 'scale(1)' },
        }
      }
    },
  },
  plugins: [],
}
