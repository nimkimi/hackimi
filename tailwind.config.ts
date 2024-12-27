import type { Config } from 'tailwindcss';

const config: Config = {
  mode: 'jit',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'media', // Use 'media' strategy for dark mode based on user's system preferences
  theme: {
    extend: {
      colors: {
        light: {
          background: '#FFFFFF',
          primary: '#1A202C',
          secondary: '#718096',
          accent: '#38B2AC',
          text: '#2D3748',
        },
        dark: {
          background: '#1A202C',
          primary: '#E2E8F0',
          secondary: '#A0AEC0',
          accent: '#38B2AC',
          text: '#E2E8F0',
        },
      },
    },
  },
  variants: {
    extend: {
      backgroundColor: ['dark'],
      textColor: ['dark'],
    },
  },
  plugins: [],
};

export default config;
