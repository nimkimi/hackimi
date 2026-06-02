import type { Config } from 'tailwindcss';

const config: Config = {
  mode: 'jit',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        base: '#0E0E10',
        surface: '#141417',
        ink: '#F5F5F0',
        muted: '#8A8A82',
        accent: '#C6FF3D',
        'accent-dim': '#A6DC2A',
      },
      fontFamily: {
        display: ['var(--font-display)', 'system-ui', 'sans-serif'],
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'ui-monospace', 'monospace'],
      },
      keyframes: {
        'toast-progress': {
          '0%': { width: '0%' },
          '100%': { width: '100%' },
        },
        'scroll-cue': {
          '0%': { transform: 'translateY(-100%)' },
          '60%, 100%': { transform: 'translateY(100%)' },
        },
      },
      animation: {
        'toast-progress': 'toast-progress 4s linear forwards',
        'scroll-cue': 'scroll-cue 2.2s cubic-bezier(0.16,1,0.3,1) infinite',
      },
    },
  },
  plugins: [],
};

export default config;
