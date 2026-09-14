/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        paper: '#f6f4ef',
        ink: {
          DEFAULT: '#1c2422',
          muted: '#5a635f',
        },
        line: '#e2dfd6',
        brand: {
          50: '#eef6f4',
          100: '#d5ebe6',
          200: '#bad9d2',
          500: '#2a6b5f',
          600: '#1f534a',
          700: '#163d37',
          800: '#102c28',
        },
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        serif: ['var(--font-serif)', 'Georgia', 'serif'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(28, 36, 34, 0.04)',
      },
    },
  },
  plugins: [],
};
