/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
          800: '#065f46',
          900: '#064e3b',
          950: '#022c22',
        },
        surface: {
          bg: '#f8fafc',      // light slate-50 background
          card: '#ffffff',    // pure white cards
          hover: '#f1f5f9',   // slate-100 hover state
          border: '#e2e8f0',  // slate-200 border lines
          muted: '#f1f5f9',   // grey/slate container backgrounds
        },
        text: {
          primary: '#0f172a',   // slate-900 for headings, primary text
          secondary: '#475569', // slate-600 for body/labels
          muted: '#94a3b8',     // slate-400 for placeholder or secondary descriptions
          inverse: '#ffffff',   // white text on dark backgrounds
        },
        success: {
          light: '#f0fdf4',
          DEFAULT: '#10b981',
          dark: '#064e3b',
        },
        warning: {
          light: '#fffbeb',
          DEFAULT: '#f59e0b',
          dark: '#78350f',
        },
        error: {
          light: '#fef2f2',
          DEFAULT: '#ef4444',
          dark: '#7f1d1d',
        },
        info: {
          light: '#f0f9ff',
          DEFAULT: '#0ea5e9',
          dark: '#0c4a6e',
        },
      },
      borderRadius: {
        '2xs': '0.125rem',
        'xs': '0.25rem',
        'sm': '0.375rem',
        'md': '0.5rem',
        'lg': '0.75rem',
        'xl': '1rem',
        '2xl': '1.25rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      boxShadow: {
        'card': '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px 0 rgba(0, 0, 0, 0.03)',
        'card-hover': '0 10px 20px -5px rgba(0, 0, 0, 0.04), 0 8px 8px -6px rgba(0, 0, 0, 0.02)',
        'modal': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        'dropdown': '0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.02)',
      },
    },
  },
  plugins: [],
};

