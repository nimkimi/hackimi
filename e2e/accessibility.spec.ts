import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

// Run with reduced motion so the intro/arrival animation does not destabilize
// the axe scan (elements mid-transition can yield flaky color-contrast / hidden
// node results). emulateMedia (not test.use) actually propagates to
// window.matchMedia, which Preloader/Reveal read for the skip path.
test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
});

const ROUTES = ['/', '/about', '/work', '/contact'] as const;

// Severities we treat as hard failures. 'minor'/'moderate' are reported but
// not asserted against here.
const BLOCKING_IMPACTS = ['serious', 'critical'] as const;

type Violation = Awaited<
  ReturnType<InstanceType<typeof AxeBuilder>['analyze']>
>['violations'][number];

function summarize(violations: Violation[], route: string): string {
  if (violations.length === 0) return `No blocking a11y violations on ${route}.`;
  const lines = violations.map((v) => {
    const nodes = v.nodes
      .map((n) => n.target.join(' '))
      .join(', ');
    return `  - [${v.impact}] ${v.id}: ${v.help}\n      help: ${v.helpUrl}\n      nodes: ${nodes}`;
  });
  return `Accessibility violations on ${route} (${violations.length}):\n${lines.join('\n')}`;
}

for (const route of ROUTES) {
  test(`accessibility (wcag2a/aa, serious+critical) on ${route}`, async ({
    page,
  }) => {
    await page.goto(route);

    // Wait for the main content to be present and visible before scanning so
    // we don't scan a mid-load / pre-hydration DOM.
    await expect(page.locator('main')).toBeVisible();
    await expect(
      page.locator('main').getByRole('heading').first()
    ).toBeVisible();

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();

    const seriousOrCritical = results.violations.filter(
      (v) => v.impact != null && BLOCKING_IMPACTS.includes(v.impact as (typeof BLOCKING_IMPACTS)[number])
    );

    // Emit a readable summary so failures are actionable in the test output.
    if (seriousOrCritical.length > 0) {
      console.log(summarize(seriousOrCritical, route));
    }

    expect(seriousOrCritical, summarize(seriousOrCritical, route)).toEqual([]);
  });
}
