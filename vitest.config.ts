import { fileURLToPath } from 'node:url';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

const r = (p: string) => fileURLToPath(new URL(p, import.meta.url));

// Shared alias map inherited by every project via `extends: true`.
const alias = {
  // Mirror the tsconfig `@/*` -> `./src/*` path mapping.
  '@': r('./src'),
  // Neutralise the `server-only` guard so server modules import cleanly
  // in tests (it otherwise throws outside a React Server Component).
  'server-only': r('./tests/setup/server-only-stub.ts'),
};

export default defineConfig({
  resolve: { alias },
  test: {
    projects: [
      {
        extends: true,
        test: {
          name: 'node',
          environment: 'node',
          include: ['tests/unit/**/*.test.ts', 'tests/server/**/*.test.{ts,tsx}'],
        },
      },
      {
        extends: true,
        plugins: [react()],
        test: {
          name: 'jsdom',
          environment: 'jsdom',
          include: ['tests/components/**/*.test.{ts,tsx}', 'tests/integration/**/*.test.{ts,tsx}'],
          setupFiles: ['./tests/setup/jsdom-setup.ts'],
        },
      },
    ],
  },
});
