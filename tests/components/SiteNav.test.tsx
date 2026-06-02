import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import SiteNav from '@/components/layout/SiteNav';

// SiteNav reads usePathname() to close the mobile menu on route change. It does
// NOT (currently) use it for active-link state — see the "active link"
// characterization test below. Mock it so the component renders under jsdom.
const pathname = vi.fn<() => string>(() => '/');
vi.mock('next/navigation', () => ({
  usePathname: () => pathname(),
}));

// The NAV_ITEMS list as declared in the source. Kept in sync by hand.
const NAV_ITEMS = [
  { label: 'Work', href: '/work' },
  { label: 'About', href: '/about' },
  { label: 'Playground', href: '/#playground' },
  { label: 'Contact', href: '/contact' },
];

afterEach(() => {
  pathname.mockReturnValue('/');
});

describe('SiteNav', () => {
  it('renders the primary nav landmark', () => {
    render(<SiteNav />);
    expect(screen.getByRole('navigation', { name: 'Primary' })).toBeInTheDocument();
  });

  it('renders the desktop nav links with correct hrefs', () => {
    render(<SiteNav />);

    // Desktop links live in the first <ul> (the second is the mobile panel).
    // Scope to the desktop list to avoid the duplicate set in the mobile panel.
    const [desktopList] = screen.getAllByRole('list');
    const utils = within(desktopList);

    for (const item of NAV_ITEMS) {
      const link = utils.getByRole('link', { name: item.label });
      expect(link).toHaveAttribute('href', item.href);
    }
  });

  it('renders the mobile-panel nav links with correct hrefs once opened', async () => {
    const user = userEvent.setup();
    render(<SiteNav />);

    // The panel is `hidden` (display:none semantics) while closed, so its links
    // are correctly absent from the accessibility tree. Open it first.
    await user.click(screen.getByRole('button', { name: 'Open menu' }));

    const panel = document.getElementById('mobile-nav-panel');
    expect(panel).not.toBeNull();
    const utils = within(panel as HTMLElement);

    for (const item of NAV_ITEMS) {
      const link = utils.getByRole('link', { name: item.label });
      expect(link).toHaveAttribute('href', item.href);
    }
  });

  it('renders a #nav-logo-slot landing target linking home', () => {
    render(<SiteNav />);

    const slot = document.getElementById('nav-logo-slot');
    expect(slot).not.toBeNull();
    // It is the home link wrapping the monogram.
    expect(slot).toHaveAttribute('href', '/');
    expect(slot).toHaveAccessibleName('Nima Hakimi — home');
  });

  describe('mobile menu toggle', () => {
    it('starts collapsed: panel hidden, toggle aria-expanded=false', () => {
      render(<SiteNav />);

      const toggle = screen.getByRole('button', { name: 'Open menu' });
      expect(toggle).toHaveAttribute('aria-expanded', 'false');
      expect(toggle).toHaveAttribute('aria-controls', 'mobile-nav-panel');

      const panel = document.getElementById('mobile-nav-panel');
      // The panel uses the `hidden` boolean attribute when closed.
      expect(panel).toHaveAttribute('hidden');
    });

    it('opens the menu on click, then closes it again', async () => {
      const user = userEvent.setup();
      render(<SiteNav />);

      const toggle = screen.getByRole('button', { name: 'Open menu' });
      const panel = document.getElementById('mobile-nav-panel') as HTMLElement;

      // Open
      await user.click(toggle);
      expect(toggle).toHaveAttribute('aria-expanded', 'true');
      expect(toggle).toHaveAccessibleName('Close menu');
      expect(panel).not.toHaveAttribute('hidden');

      // Close again (label flipped to "Close menu" while open)
      const closeToggle = screen.getByRole('button', { name: 'Close menu' });
      await user.click(closeToggle);
      expect(closeToggle).toHaveAttribute('aria-expanded', 'false');
      expect(panel).toHaveAttribute('hidden');
    });

    it('closes the menu when a mobile-panel link is clicked', async () => {
      const user = userEvent.setup();
      render(<SiteNav />);

      const toggle = screen.getByRole('button', { name: 'Open menu' });
      await user.click(toggle);
      expect(toggle).toHaveAttribute('aria-expanded', 'true');

      const panel = document.getElementById('mobile-nav-panel') as HTMLElement;
      const workLink = within(panel).getByRole('link', { name: 'Work' });
      await user.click(workLink);

      expect(
        screen.getByRole('button', { name: 'Open menu' }),
      ).toHaveAttribute('aria-expanded', 'false');
      expect(panel).toHaveAttribute('hidden');
    });

    it('closes the menu on Escape', async () => {
      const user = userEvent.setup();
      render(<SiteNav />);

      const toggle = screen.getByRole('button', { name: 'Open menu' });
      await user.click(toggle);
      expect(toggle).toHaveAttribute('aria-expanded', 'true');

      await user.keyboard('{Escape}');

      expect(
        screen.getByRole('button', { name: 'Open menu' }),
      ).toHaveAttribute('aria-expanded', 'false');
    });
  });

  describe('tap targets (44px minimum)', () => {
    it('the menu toggle button is 44x44 (h-11 w-11)', () => {
      render(<SiteNav />);
      const toggle = screen.getByRole('button', { name: 'Open menu' });
      // Tailwind h-11/w-11 == 2.75rem == 44px.
      expect(toggle).toHaveClass('h-11', 'w-11');
    });

    it('the compact mobile CTA meets the 44px min height (min-h-11)', () => {
      render(<SiteNav />);
      // The mobile CTA is a plain <a> outside the mobile panel and desktop list.
      const ctas = screen.getAllByRole('link', { name: /Let.?s talk/i });
      const mobileCta = ctas.find((el) => el.className.includes('min-h-11'));
      expect(mobileCta).toBeDefined();
      expect(mobileCta).toHaveClass('min-h-11');
      expect(mobileCta).toHaveAttribute('href', '/contact');
    });
  });

  describe('active link (characterization)', () => {
    // The source calls usePathname() only to close the menu on route change;
    // it does NOT mark the current route's link with an active class or
    // aria-current. This test documents that absence so a future change that
    // adds active-link styling will (intentionally) break it and prompt review.
    it('does not apply aria-current to the current route link', () => {
      pathname.mockReturnValue('/work');
      render(<SiteNav />);

      const [desktopList] = screen.getAllByRole('list');
      const workLink = within(desktopList).getByRole('link', { name: 'Work' });
      expect(workLink).not.toHaveAttribute('aria-current');
    });
  });
});
