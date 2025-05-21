/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          'Noto Sans KR',
          'Malgun Gothic',
          'Apple SD Gothic Neo',
          'Arial',
          'sans-serif'
        ],
      },
      colors: {
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
      },
    },
  },
  plugins: [],
  safelist: [
    'bg-gray-50',
    'text-blue-800',
    'text-gray-800',
    'text-gray-900',
    'border',
    'border-gray-200',
    'border-blue-800',
    'font-bold',
    'mb-2',
    'mb-4',
    'px-2',
    'py-1',
    'table-auto',
    'w-full',
  ],
} 