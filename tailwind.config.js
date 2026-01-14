/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Familjen Grotesk', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ['IBM Plex Mono', 'monospace'],
      },
      colors: {
        dark: {
          900: '#f8fafc',
          800: '#ffffff',
          700: '#f1f5f9',
          600: '#e2e8f0',
          500: '#cbd5e1',
        },
        accent: {
          green: '#10b981',
          red: '#f43f5e',
          blue: '#0ea5e9',
          yellow: '#f59e0b',
          purple: '#8b5cf6',
        }
      },
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1.4' }],
        'sm': ['0.875rem', { lineHeight: '1.5' }],
        'base': ['0.9375rem', { lineHeight: '1.6' }],
        'lg': ['1.125rem', { lineHeight: '1.5' }],
        'xl': ['1.25rem', { lineHeight: '1.4' }],
        '2xl': ['1.5rem', { lineHeight: '1.3' }],
        '3xl': ['2rem', { lineHeight: '1.2' }],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
      boxShadow: {
        'soft': '0 1px 3px 0 rgba(0, 0, 0, 0.03)',
        'medium': '0 4px 12px 0 rgba(0, 0, 0, 0.06)',
        'hard': '0 10px 30px 0 rgba(0, 0, 0, 0.1)',
      },
    },
  },
  plugins: [],
}
