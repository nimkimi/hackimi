import { test, expect, type Page } from '@playwright/test';

// Reduced motion keeps the ~2s monogram intro and masked reveals instant, so
// nav links / headings are interactable immediately and the suite stays stable.
// emulateMedia (not test.use) actually propagates to window.matchMedia, which
// is what Preloader/Reveal read for the skip path.
test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
});

// A Next.js server action posts back to the current route with a `Next-Action`
// request header. We match on that to reliably catch the contact submission
// regardless of the exact action endpoint.
function isServerActionPost(request: { method(): string; headers(): Record<string, string> }) {
  if (request.method() !== 'POST') return false;
  const headers = request.headers();
  return Boolean(headers['next-action'] || headers['Next-Action']);
}

async function gotoHome(page: Page) {
  await page.goto('/');
  // Logo slot is the arrival-animation landing target and is present once the
  // nav has mounted — a good readiness signal across motion settings.
  await expect(page.locator('#nav-logo-slot')).toBeVisible();
}

test.describe('Primary navigation (desktop)', () => {
  test('nav links route to Work, About, and Contact', async ({ page }) => {
    await gotoHome(page);

    await page.getByRole('link', { name: 'Work', exact: true }).click();
    await expect(page).toHaveURL(/\/work$/);
    await expect(page.getByRole('heading', { name: 'Selected Work' })).toBeVisible();

    await page.getByRole('link', { name: 'About', exact: true }).click();
    await expect(page).toHaveURL(/\/about$/);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

    await page.getByRole('link', { name: 'Contact', exact: true }).click();
    await expect(page).toHaveURL(/\/contact$/);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });
});

test.describe('Mobile menu', () => {
  test.use({ viewport: { width: 375, height: 812 } });

  test('toggle opens the menu, link navigates and closes it', async ({ page }) => {
    await gotoHome(page);

    // On mobile the desktop link list is hidden; the toggle button is shown.
    const toggle = page.getByRole('button', { name: 'Open menu' });
    await expect(toggle).toBeVisible();

    const panel = page.locator('#mobile-nav-panel');
    await expect(panel).toBeHidden();

    await toggle.click();
    await expect(panel).toBeVisible();

    const workLink = panel.getByRole('link', { name: 'Work', exact: true });
    await expect(workLink).toBeVisible();

    await workLink.click();
    await expect(page).toHaveURL(/\/work$/);
    await expect(page.getByRole('heading', { name: 'Selected Work' })).toBeVisible();

    // Route change closes the menu.
    await expect(panel).toBeHidden();
  });
});

test.describe('Work browse', () => {
  test('first case study link opens its detail page', async ({ page }) => {
    await page.goto('/work');
    await expect(page.getByRole('heading', { name: 'Selected Work' })).toBeVisible();

    const firstCase = page.locator('.work-list a.work-row').first();
    const title = (await firstCase.locator('.work-row__name').first().innerText()).trim();
    expect(title.length).toBeGreaterThan(0);

    await firstCase.click();
    await expect(page).toHaveURL(/\/work\/[^/]+$/);
    await expect(page.getByRole('heading', { level: 1, name: title })).toBeVisible();
  });
});

test.describe('Contact form', () => {
  test('empty submit is blocked by required validation', async ({ page }) => {
    // Guard: the server action must never fire for an empty form.
    let actionFired = false;
    await page.route('**/contact', async (route) => {
      if (isServerActionPost(route.request())) {
        actionFired = true;
        await route.abort();
        return;
      }
      await route.continue();
    });

    await page.goto('/contact');
    const form = page.locator('form');
    await expect(form).toBeVisible();

    await page.getByRole('button', { name: 'Send message' }).click();

    // Native required validation should keep focus on the first invalid field
    // and prevent submission; the name input reports invalid.
    const nameValid = await page
      .locator('#name')
      .evaluate((el: HTMLInputElement) => el.validity.valid);
    expect(nameValid).toBe(false);

    // Form is still present and no success toast appeared.
    await expect(form).toBeVisible();
    await expect(page.getByText('Message sent')).toHaveCount(0);
    expect(actionFired).toBe(false);
  });

  test('valid submit reaches the sending state without sending mail', async ({ page }) => {
    // Intercept the server-action POST and abort it so SMTP is never touched —
    // no real email goes out. Faithfully mocking a server-action response to
    // drive useActionState into a success state is not reliably possible with
    // page.route (the RSC stream closes), so we assert the submission wiring up
    // to the pending/"Sending…" state. The true success path is covered by the
    // unit test for submitContact (T7).
    let actionFired = false;
    await page.route('**/contact', async (route) => {
      if (isServerActionPost(route.request())) {
        actionFired = true;
        // Hold the request open briefly so the pending UI is observable, then
        // abort — the action result never resolves into success, and no email
        // is ever sent.
        await new Promise((r) => setTimeout(r, 1500));
        await route.abort();
        return;
      }
      await route.continue();
    });

    await page.goto('/contact');
    await expect(page.locator('form')).toBeVisible();

    await page.locator('#name').fill('Ada Lovelace');
    await page.locator('#email').fill('ada@example.com');
    await page.locator('#subject').fill('Hello there');
    await page.locator('#message').fill('This is a test message that is long enough.');

    const submit = page.getByRole('button', { name: 'Send message' });
    await submit.click();

    // Pending state: button shows the spinner copy and is disabled.
    await expect(page.getByText('Sending…')).toBeVisible();
    await expect(page.getByRole('button', { name: /Sending/ })).toBeDisabled();
    expect(actionFired).toBe(true);
  });
});
