/** @type {import('tailwindcss').Config} */
// 싱싱골프투어 색상 import
const { tailwindColors } = require('./styles/colors');

module.exports = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  safelist: [
    // 코스별 색상 safelist
    'bg-green-50', 'border-green-300', 'bg-green-100', 'text-green-800',
    'bg-blue-50', 'border-blue-300', 'bg-blue-100', 'text-blue-800',
    'bg-amber-50', 'border-amber-300', 'bg-amber-100', 'text-amber-800',
    'bg-purple-50', 'border-purple-300', 'bg-purple-100', 'text-purple-800',
    'bg-pink-50', 'border-pink-300', 'bg-pink-100', 'text-pink-800',
    'bg-indigo-50', 'border-indigo-300', 'bg-indigo-100', 'text-indigo-800',
    'bg-teal-50', 'border-teal-300', 'bg-teal-100', 'text-teal-800',
    'bg-yellow-50', 'border-yellow-300', 'bg-yellow-100', 'text-yellow-800',
    'bg-sky-50', 'border-sky-300', 'bg-sky-100', 'text-sky-800',
    'bg-gray-50', 'border-gray-300', 'bg-gray-100', 'text-gray-800',
    'border-t-2', 'hover:opacity-80',
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
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
        // 싱싱골프투어 전용 색상
        ...tailwindColors,
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: 0 },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: 0 },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} 