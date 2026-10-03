import type { Config } from 'tailwindcss';

export default {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: 'var(--csmju-color-primary-soft)',
          100: 'var(--csmju-color-primary-soft)',
          500: 'var(--csmju-color-primary)',
          600: 'var(--csmju-color-primary)',
          700: 'var(--csmju-color-primary)',
          800: 'var(--csmju-color-primary-hover)',
        },
        ink: 'var(--csmju-color-text-body)',
        surface: 'var(--csmju-color-canvas)',
      },
      borderRadius: {
        card: 'var(--csmju-radius-lg)',
      },
      fontFamily: {
        sans: ['var(--csmju-font-body)'],
      },
    },
  },
  plugins: [],
} satisfies Config;
