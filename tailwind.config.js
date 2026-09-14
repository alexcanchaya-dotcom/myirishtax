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
        brand: {
          50: '#eef6ff',
          500: '#1d4ed8',
          600: '#1e40af',
        },
        background: '#f3eee4',
        foreground: '#1c1412',
        card: {
          DEFAULT: '#fbf7ef',
          foreground: '#1c1412',
        },
        muted: {
          DEFAULT: '#ebe4d6',
          foreground: '#6f6458',
        },
        primary: {
          DEFAULT: '#9b1b2e',
          foreground: '#fbf7ef',
        },
        secondary: {
          DEFAULT: '#241c1a',
          foreground: '#f6f0e6',
        },
        border: '#d9d0c0',
        ring: '#9b1b2e',
        danger: {
          DEFAULT: '#9b1b2e',
          foreground: '#fbf7ef',
        },
        sheet: '#fffdf8',
        grid: '#e4dccb',
        formula: '#2f5a3c',
        profit: '#1f6b45',
        loss: '#9b1b2e',
        section: '#efe6d5',
        colhead: '#f4ece0',
        'ink-soft': '#3a322c',
      },
      fontFamily: {
        sans: ['IBM Plex Sans', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['Source Serif 4', 'Iowan Old Style', 'Georgia', 'serif'],
        mono: ['IBM Plex Mono', 'ui-monospace', 'Menlo', 'monospace'],
      },
      borderRadius: {
        sm: '6px',
        md: '10px',
        lg: '16px',
        xl: '24px',
      },
    },
  },
  plugins: [],
};
