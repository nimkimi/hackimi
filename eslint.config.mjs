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

  // `react-hooks/set-state-in-effect` is newly an error in eslint-config-next
  // 16. It fires on six components that set state from an effect: the
  // SSR-safe `prefers-reduced-motion` reads (Reveal, Preloader), the toast
  // enter/exit transition, and the route-change menu close in SiteNav. Each is
  // a real (small) cascading-render cost, but fixing them means reworking the
  // arrival animation and motion internals — a behaviour change that does not
  // belong in a version upgrade. Demoted to a warning so the signal stays
  // visible; fix tracked separately, and it should land before React Compiler
  // is enabled, since that is the same class of code the compiler reasons about.
  {
    rules: { 'react-hooks/set-state-in-effect': 'warn' },
  },

  // Test fixtures render a bare <img> on purpose — the LCP/bandwidth advice
  // behind `no-img-element` is about shipped pages, not assertions.
  {
    files: ['tests/**', 'e2e/**'],
    rules: { '@next/next/no-img-element': 'off' },
  },
]);
