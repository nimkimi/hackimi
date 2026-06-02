import { render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import work from '@/data/work';
import about from '@/data/about';
import { SITE_AUTHOR } from '@/lib/site';

/**
 * Integration tests for the App Router pages.
 *
 * These pages are React Server Components. Home / About / Work are *synchronous*
 * default exports, so they render directly. work/[slug] is an *async* RSC whose
 * `params` is a `Promise` (Next 15 convention) — we invoke it as a function,
 * await the returned element, then render it:
 *
 *   const ui = await CasePage({ params: Promise.resolve({ slug }) });
 *   render(ui);
 *
 * The pages pull in client islands (Reveal, MagneticButton, the Playground
 * demos, WorkRow). These use `motion/react` + IntersectionObserver/matchMedia,
 * all of which the jsdom setup (tests/setup/jsdom-setup.ts) already stubs, so
 * the trees render in full under jsdom without extra mocking. The only mock
 * required is `next/navigation`'s `notFound`, which we make a throwing spy so
 * the unknown-slug branch is observable.
 */

const notFound = vi.fn(() => {
  throw new Error('NEXT_NOT_FOUND');
});
vi.mock('next/navigation', () => ({
  notFound: () => notFound(),
}));

afterEach(() => {
  notFound.mockClear();
});

describe('Home page (/)', () => {
  it('renders the hero heading', async () => {
    const Home = (await import('@/app/page')).default;
    render(<Home />);

    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toHaveTextContent('Nima Hakimi');
  });

  it('renders the "Selected Work" section and the first project title', async () => {
    const Home = (await import('@/app/page')).default;
    render(<Home />);

    expect(screen.getByText('Selected Work')).toBeInTheDocument();
    // Every case from the data layer gets a WorkRow link on the home page.
    for (const c of work) {
      expect(
        screen.getByRole('link', { name: `View case study: ${c.title}` }),
      ).toBeInTheDocument();
    }
  });

  it('exports page metadata derived from buildPageMetadata', async () => {
    const { metadata } = await import('@/app/page');
    expect(metadata.title).toBe('Portfolio');
    expect(metadata.description).toContain('Nima Hakimi');
  });
});

describe('About page (/about)', () => {
  it('renders the about hero heading and intro copy', async () => {
    const About = (await import('@/app/about/page')).default;
    render(<About />);

    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toHaveTextContent('I’m a frontend developer');
    expect(heading).toHaveTextContent('designer’s');

    // The intro paragraph interpolates the location from the data layer.
    expect(screen.getByText(new RegExp(about.location))).toBeInTheDocument();
  });

  it('renders an <h3> heading for each experience entry', async () => {
    const About = (await import('@/app/about/page')).default;
    render(<About />);

    // Experience titles render inside <h3> alongside the company ("{title} @
    // {company}"), so the title text is split across nodes. Assert against the
    // heading's full textContent rather than an exact text match.
    const headings = screen.getAllByRole('heading', { level: 3 });
    for (const exp of about.experience) {
      expect(
        headings.some((h) => h.textContent?.includes(exp.title)),
      ).toBe(true);
    }
  });

  it('renders the technical skills from data/about', async () => {
    const About = (await import('@/app/about/page')).default;
    render(<About />);

    // Some skills (e.g. "Astro.js", "Kotlin") also appear as experience tech
    // tags elsewhere on the page, so the same label can occur more than once.
    for (const skill of about.skills.technical) {
      expect(screen.getAllByText(skill).length).toBeGreaterThan(0);
    }
  });

  it('exports page metadata for /about', async () => {
    const { metadata } = await import('@/app/about/page');
    expect(metadata.title).toBe('About');
    expect(metadata.description).toContain('Nima Hakimi');
  });
});

describe('Work list page (/work)', () => {
  it('renders the page heading and lead', async () => {
    const Work = (await import('@/app/work/page')).default;
    render(<Work />);

    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toHaveTextContent('Selected Work');
  });

  it('renders one case-study link per entry in data/work', async () => {
    const Work = (await import('@/app/work/page')).default;
    render(<Work />);

    const links = screen.getAllByRole('link', { name: /^View case study:/ });
    expect(links).toHaveLength(work.length);

    for (const c of work) {
      const link = screen.getByRole('link', { name: `View case study: ${c.title}` });
      expect(link).toHaveAttribute('href', `/work/${c.slug}`);
    }
  });

  it('exports page metadata for /work', async () => {
    const { metadata } = await import('@/app/work/page');
    expect(metadata.title).toBe('Work');
  });
});

describe('Work case page (/work/[slug])', () => {
  it('generateStaticParams returns one entry per work slug', async () => {
    const { generateStaticParams } = await import('@/app/work/[slug]/page');
    const params = generateStaticParams();

    expect(params).toEqual(work.map((c) => ({ slug: c.slug })));
    expect(params).toHaveLength(work.length);
  });

  it('renders the case title for a valid slug', async () => {
    const CasePage = (await import('@/app/work/[slug]/page')).default;
    const c = work[0];

    const ui = await CasePage({ params: Promise.resolve({ slug: c.slug }) });
    render(ui);

    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toHaveTextContent(c.title);
    expect(notFound).not.toHaveBeenCalled();
  });

  it('renders each case study correctly for every slug', async () => {
    const CasePage = (await import('@/app/work/[slug]/page')).default;

    for (const c of work) {
      const ui = await CasePage({ params: Promise.resolve({ slug: c.slug }) });
      const { unmount } = render(ui);
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(c.title);
      unmount();
    }
    expect(notFound).not.toHaveBeenCalled();
  });

  it('calls notFound() for an unknown slug', async () => {
    const CasePage = (await import('@/app/work/[slug]/page')).default;

    // The page calls notFound() (our throwing spy) when no case matches.
    await expect(
      CasePage({ params: Promise.resolve({ slug: 'does-not-exist' }) }),
    ).rejects.toThrow('NEXT_NOT_FOUND');
    expect(notFound).toHaveBeenCalledTimes(1);
  });

  it('generateMetadata returns a title/description derived from the case', async () => {
    const { generateMetadata } = await import('@/app/work/[slug]/page');
    const c = work[0];

    const meta = await generateMetadata({ params: Promise.resolve({ slug: c.slug }) });

    expect(meta.title).toBe(c.title);
    expect(meta.description).toBe(c.summary);
    // buildPageMetadata appends the author suffix in the OG title.
    expect(meta.openGraph?.title).toBe(`${c.title} | ${SITE_AUTHOR}`);
    expect(meta.alternates?.canonical).toContain(`/work/${c.slug}`);
  });

  it('generateMetadata returns an empty object for an unknown slug', async () => {
    const { generateMetadata } = await import('@/app/work/[slug]/page');

    const meta = await generateMetadata({
      params: Promise.resolve({ slug: 'does-not-exist' }),
    });
    expect(meta).toEqual({});
  });
});
