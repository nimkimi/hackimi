import { defineConfig, globalIgnores } from 'eslint/config';
import nextCoreWebVitals from 'eslint-config-next/core-web-vitals';

// Flat config, required as of Next.js 16: `next lint` is gone and the Next
// plugin ships flat config by default. `eslint .` walks the whole repo, so the
// build and report output that `next lint` used to skip for us has to be
// ignored explicitly — otherwise ESLint parses .next/ and takes minutes.
export default defineConfig([
  globalIgnores([
    '.next/**',
    'out/**',
    'build/**',
    'coverage/**',
    'test-results/**',
    'playwright-report/**',
    'blob-report/**',
    'next-env.d.ts',
  ]),
  { extends: [...nextCoreWebVitals] },

  // Test fixtures render a bare <img> on purpose — the LCP/bandwidth advice
  // behind `no-img-element` is about shipped pages, not assertions.
  {
    files: ['tests/**', 'e2e/**'],
    rules: { '@next/next/no-img-element': 'off' },
  },
]);
