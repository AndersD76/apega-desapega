/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
    "./index.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // Brand colors
        primary: {
          DEFAULT: '#61005D',
          light: '#7B1A75',
          extraLight: 'rgba(97, 0, 93, 0.08)',
          50: '#fdf4fd',
          100: '#fbe8fb',
          200: '#f5d0f4',
          300: '#eda9ea',
          400: '#e076db',
          500: '#cd4cc4',
          600: '#a92fa5',
          700: '#8a2586',
          800: '#61005D',
          900: '#4a0047',
        },
        accent: {
          DEFAULT: '#FF6B6B',
          light: '#FF8A8A',
          dark: '#E85555',
        },
        success: {
          DEFAULT: '#10B981',
          light: '#34D399',
        },
        warning: {
          DEFAULT: '#F59E0B',
          light: '#FBBF24',
        },
        info: {
          DEFAULT: '#3B82F6',
          light: '#60A5FA',
        },
        error: {
          DEFAULT: '#EF4444',
          light: '#F87171',
        },
        // UI Colors
        surface: '#FFFFFF',
        background: '#FAFAFA',
        'background-dark': '#F3F4F6',
        border: {
          DEFAULT: '#E5E7EB',
          light: '#F3F4F6',
        },
        // Text colors
        text: {
          primary: '#111827',
          secondary: '#6B7280',
          tertiary: '#9CA3AF',
        },
        // Glass effects
        glass: {
          DEFAULT: 'rgba(255, 255, 255, 0.85)',
          dark: 'rgba(255, 255, 255, 0.95)',
          border: 'rgba(255, 255, 255, 0.2)',
        },
      },
      borderRadius: {
        '4xl': '2rem',
      },
      boxShadow: {
        'card': '0 2px 8px rgba(0, 0, 0, 0.06)',
        'card-hover': '0 8px 24px rgba(0, 0, 0, 0.1)',
        'primary': '0 4px 14px rgba(97, 0, 93, 0.25)',
        'nav': '0 -4px 24px rgba(0, 0, 0, 0.08)',
      },
      fontFamily: {
        sans: ['System', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
