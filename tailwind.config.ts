import type { Config } from 'tailwindcss';

const config: Config = {
  mode: 'jit',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'media',
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
      keyframes: {
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'float-slow': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        'shimmer': {
          '0%': { backgroundPosition: '0% 50%' },
          '100%': { backgroundPosition: '200% 50%' },
        },
      },
      animation: {
        'fade-in-up': 'fade-in-up 0.6s ease-out both',
        'float-slow': 'float-slow 4s ease-in-out infinite',
        'shimmer': 'shimmer 4s linear infinite',
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
