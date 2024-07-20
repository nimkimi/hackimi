import type { Config } from 'tailwindcss';

const config: Config = {
  mode: 'jit', // Enable JIT mode
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'media', // Automatically switch to dark mode based on user's system preferences
  theme: {
    extend: {
      // Define your color palette centrally
      colors: {
        'bg-light': 'var(--color-bg-light)', // Light theme background color
        'bg-dark': 'var(--color-bg-dark)', // Dark theme background color
        'text-light': 'var(--color-text-light)', // Light theme text color
        'text-dark': 'var(--color-text-dark)', // Dark theme text color
      },
      // Extend other styles if needed
      backgroundColor: (theme) => ({
        ...theme('colors'),
        light: '#f7fafc', // Fallback or light theme background color
        dark: '#2d3748', // Dark theme background color
      }),
      textColor: (theme) => ({
        ...theme('colors'),
        light: '#111827', // Fallback or light theme text color
        dark: '#f9fafb', // Dark theme text color
      }),
      container: {
        center: true,
        padding: '1rem',
      },
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
};

export default config;
