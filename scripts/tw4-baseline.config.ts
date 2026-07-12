import { defineConfig } from '@playwright/test';

/**
 * Config for the temporary baseline spec only (scripts/tw4-baseline.spec.ts).
 * Separate from the repo's playwright.config.ts because that one is pinned
 * to port 3000 / testDir 'e2e' and manages its own dev-server webServer.
 * Port 3000 is occupied by an unrelated long-running process on this
 * machine, so the baseline server runs on 3200 instead — started manually
 * (`next build && next start -p 3200`) before this config is invoked, hence
 * no `webServer` entry here.
 */
export default defineConfig({
  testDir: '.',
  testMatch: 'tw4-baseline.spec.ts',
  fullyParallel: true,
  reporter: 'list',
  use: {
    baseURL: 'http://localhost:3200',
  },
  projects: [{ name: 'chromium', use: { browserName: 'chromium' } }],
});
