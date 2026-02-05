/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./layouts/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: '#F3F0E7',
        charcoal: '#1F1F1F',
        'nav-black': '#232320',
        'nav-yellow': '#F3CB0A',
        'nav-red': '#E94D37',
        'forest-green': '#2D4628',
        'burnt-orange': '#D96C47',
        'soft-yellow': '#FAEAB1',
        'card-white': '#FFFFFF',
      },
      fontFamily: {
        sans: ['"Inter"', '"DM Sans"', 'sans-serif'],
        serif: ['"DM Serif Display"', 'serif'],
        script: ['"Dancing Script"', 'cursive'],
      },
      boxShadow: {
        'brutal': '4px 4px 0px 0px rgba(31,31,31,1)',
        'soft': '0 10px 40px -10px rgba(0,0,0,0.08)',
      },
      animation: {
        'marquee': 'marquee 30s linear infinite',
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        }
      }
    },
  },
  plugins: [],
}
