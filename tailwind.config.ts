import type { Config } from 'tailwindcss';

export default {
  darkMode: 'class',
  content: ['./app/**/*.{js,ts,jsx,tsx,mdx}', './components/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#ffe4f0',
          100: '#ffd6e8',
          500: '#ec4899',
          600: '#db2777',
          700: '#be185d',
        },
        accent: '#f472b6',
        ink: '#0f172a',
      },
    },
  },
  plugins: [],
} satisfies Config;
