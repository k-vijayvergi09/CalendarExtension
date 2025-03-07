/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html",
    "./App.tsx"
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Roboto', 'sans-serif'],
      },
      colors: {
        blue: {
          100: '#dbeafe',
          900: '#1e3a8a',
        },
        purple: {
          100: '#f3e8ff',
          900: '#581c87',
        },
        pink: {
          100: '#fce7f3',
          900: '#831843',
        },
        yellow: {
          100: '#fef9c3',
          900: '#713f12',
        },
        green: {
          100: '#dcfce7',
          900: '#14532d',
        },
        orange: {
          100: '#ffedd5',
          900: '#7c2d12',
        },
      },
    },
  },
  plugins: [],
}; 