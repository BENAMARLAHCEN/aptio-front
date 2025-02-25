// tailwind.config.js
const colors = require('tailwindcss/colors')

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          light: '#E3F2FD',
          DEFAULT: '#2196F3',
          dark: '#1565C0',
        },
        secondary: {
          light: '#E8F5E9',
          DEFAULT: '#4CAF50',
          dark: '#2E7D32',
        },
        neutral: {
          light: '#F5F7FA',
          DEFAULT: '#64748B',
          dark: '#1E293B',
        },
        status: {
          success: '#4CAF50',
          warning: '#FFC107',
          error: '#EF4444',
          info: '#2196F3',
        }
      },
      spacing: {
        'layout-sm': '0.5rem',
        'layout-md': '1rem',
        'layout-lg': '1.5rem',
        'layout-xl': '2rem',
      },
      borderRadius: {
        'card': '0.5rem',
        'button': '0.375rem',
        'input': '0.375rem',
      },
      boxShadow: {
        'card': '0 2px 4px rgba(0, 0, 0, 0.1)',
        'dropdown': '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        'modal': '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
      },
      gridTemplateColumns: {
        'calendar': 'repeat(7, minmax(0, 1fr))',
        'time-slots': 'repeat(auto-fill, minmax(6rem, 1fr))',
      },
      minHeight: {
        'calendar-cell': '6rem',
        'card': '10rem',
      },
      zIndex: {
        'modal': 50,
        'dropdown': 40,
        'header': 30,
        'sidebar': 20,
      }
    },
  },
  plugins: [],
}