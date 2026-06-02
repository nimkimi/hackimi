import { describe, it, expect, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import type { CaseStudy, CaseImage, CaseSection } from '@/data/work';
import work from '@/data/work';
import WorkRow from '@/components/work/WorkRow';
import CaseHero from '@/components/work/CaseHero';
import CaseSectionComponent from '@/components/work/CaseSection';
import CaseFigure from '@/components/work/CaseFigure';
import { CaseGallery } from '@/components/work/CaseGallery';

// next/image renders fine in jsdom for most props, but to keep these tests
// hermetic and avoid relying on its internal loader/srcset behaviour we mock
// it to a plain <img>. We deliberately forward `alt`, `src`, and the rest so
// the components' real prop wiring is still exercised. (Documented per task.)
vi.mock('next/image', () => ({
  __esModule: true,
  default: ({ src, alt, ...rest }: { src: string; alt: string }) => {
    // strip props jsdom warns about / aren't valid on a native img
    const { priority, fill, sizes, ...imgRest } = rest as Record<string, unknown>;
    void priority;
    void fill;
    return <img src={typeof src === 'string' ? src : ''} alt={alt} {...imgRest} sizes={sizes as string} />;
  },
}));

// A fully-specified fixture matching the exported types.
const fixture: CaseStudy = {
  slug: 'test-case',
  title: 'Test Case Title',
  summary: 'A concise one-line summary of the outcome.',
  year: '2025',
  role: 'Solo full-stack',
  tech: ['Next.js', 'React', 'TypeScript', 'Tailwind', 'Postgres'],
  links: [{ label: 'GitHub', href: 'https://example.com/repo' }],
  inProgress: false,
  images: [
    { src: '/work/test/cover.jpg', alt: 'The cover screenshot', caption: 'Cover' },
    { src: '/work/test/feed.jpg', alt: 'The feed screenshot', caption: 'Feed' },
    { src: '/work/test/detail.jpg', alt: 'The detail screenshot' },
  ],
  sections: [
    { heading: 'Context', body: 'Context body text.' },
    { heading: 'My role', body: 'My role body text.' },
    { heading: 'Problem', body: 'Problem body text.' },
    { heading: 'Approach', body: 'Approach body text.' },
    { heading: 'Result', body: 'Result body text.' },
  ],
};

describe('WorkRow', () => {
  it('renders the title, summary, year, and role', () => {
    render(<WorkRow c={fixture} index={0} />);
    expect(screen.getByText(fixture.title)).toBeInTheDocument();
    expect(screen.getByText(fixture.summary)).toBeInTheDocument();
    // NOTE (characterization): WorkRow does NOT render the case's year or role.
    // It only shows the index number, title, summary, and tech tags. The task
    // brief expected year + role here; the real component omits both.
    expect(screen.queryByText(fixture.year)).not.toBeInTheDocument();
    expect(screen.queryByText(fixture.role)).not.toBeInTheDocument();
  });

  it('links to /work/${slug} with an accessible label', () => {
    render(<WorkRow c={fixture} index={0} />);
    const link = screen.getByRole('link', { name: `View case study: ${fixture.title}` });
    expect(link).toHaveAttribute('href', `/work/${fixture.slug}`);
  });

  it('renders the zero-padded 1-based index', () => {
    render(<WorkRow c={fixture} index={0} />);
    expect(screen.getByText('01')).toBeInTheDocument();
  });

  it('shows the "In progress" indicator when inProgress is true', () => {
    render(<WorkRow c={{ ...fixture, inProgress: true }} index={2} />);
    expect(screen.getByText('In progress')).toBeInTheDocument();
  });

  it('omits the "In progress" indicator when inProgress is false', () => {
    render(<WorkRow c={{ ...fixture, inProgress: false }} index={0} />);
    expect(screen.queryByText('In progress')).not.toBeInTheDocument();
  });

  it('omits the "In progress" indicator when inProgress is undefined', () => {
    const { inProgress, ...rest } = fixture;
    void inProgress;
    render(<WorkRow c={rest as CaseStudy} index={0} />);
    expect(screen.queryByText('In progress')).not.toBeInTheDocument();
  });

  it('renders up to the first four tech tags', () => {
    render(<WorkRow c={fixture} index={0} />);
    for (const t of fixture.tech.slice(0, 4)) {
      expect(screen.getByText(t)).toBeInTheDocument();
    }
    // 5th tag is sliced off.
    expect(screen.queryByText(fixture.tech[4])).not.toBeInTheDocument();
  });

  it('works with a real case from data/work', () => {
    const real = work[0];
    render(<WorkRow c={real} index={0} />);
    expect(screen.getByText(real.title)).toBeInTheDocument();
    const link = screen.getByRole('link', { name: `View case study: ${real.title}` });
    expect(link).toHaveAttribute('href', `/work/${real.slug}`);
  });
});

describe('CaseHero', () => {
  it('renders the title and summary', () => {
    render(<CaseHero c={fixture} />);
    expect(screen.getByRole('heading', { level: 1, name: fixture.title })).toBeInTheDocument();
    expect(screen.getByText(fixture.summary)).toBeInTheDocument();
  });

  it('renders the role · year meta strip', () => {
    render(<CaseHero c={fixture} />);
    expect(screen.getByText(`${fixture.role} · ${fixture.year}`)).toBeInTheDocument();
  });

  it('renders all tech tags', () => {
    render(<CaseHero c={fixture} />);
    for (const t of fixture.tech) {
      expect(screen.getByText(t)).toBeInTheDocument();
    }
  });

  it('renders external links when present', () => {
    render(<CaseHero c={fixture} />);
    const link = screen.getByRole('link', { name: /GitHub/ });
    expect(link).toHaveAttribute('href', 'https://example.com/repo');
    expect(link).toHaveAttribute('target', '_blank');
  });

  it('renders no links when links are absent', () => {
    const { links, ...rest } = fixture;
    void links;
    render(<CaseHero c={rest as CaseStudy} />);
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });

  it('shows the "In progress" badge when flagged', () => {
    render(<CaseHero c={{ ...fixture, inProgress: true }} />);
    expect(screen.getByText('In progress')).toBeInTheDocument();
  });

  it('omits the "In progress" badge by default', () => {
    render(<CaseHero c={fixture} />);
    expect(screen.queryByText('In progress')).not.toBeInTheDocument();
  });
});

describe('CaseSection', () => {
  const section: CaseSection = { heading: 'Approach', body: 'The approach narrative body.' };

  it('renders the heading with a 1-based zero-padded number', () => {
    render(<CaseSectionComponent section={section} index={2} />);
    expect(
      screen.getByRole('heading', { level: 2, name: `03 / ${section.heading}` }),
    ).toBeInTheDocument();
  });

  it('renders the body text', () => {
    render(<CaseSectionComponent section={section} index={0} />);
    expect(screen.getByText(section.body)).toBeInTheDocument();
  });

  it('pads the number to two digits for index 0', () => {
    render(<CaseSectionComponent section={section} index={0} />);
    expect(screen.getByText(`01 / ${section.heading}`)).toBeInTheDocument();
  });
});

describe('CaseFigure', () => {
  it('renders the image with the provided alt text', () => {
    const image: CaseImage = { src: '/work/test/shot.jpg', alt: 'A descriptive alt', caption: 'Shot' };
    render(<CaseFigure image={image} sizes="100vw" />);
    const img = screen.getByRole('img', { name: 'A descriptive alt' });
    expect(img).toHaveAttribute('src', image.src);
  });

  it('renders the caption when present', () => {
    const image: CaseImage = { src: '/work/test/shot.jpg', alt: 'Alt', caption: 'My caption' };
    render(<CaseFigure image={image} sizes="100vw" />);
    expect(screen.getByText('My caption')).toBeInTheDocument();
  });

  it('omits the figcaption when no caption is given', () => {
    const image: CaseImage = { src: '/work/test/shot.jpg', alt: 'Alt only' };
    const { container } = render(<CaseFigure image={image} sizes="100vw" />);
    expect(container.querySelector('figcaption')).toBeNull();
  });
});

describe('CaseGallery', () => {
  it('renders all images EXCEPT the cover (first image), each with its alt', () => {
    render(<CaseGallery images={fixture.images} />);
    // The first image (cover) is sliced out — CaseGallery shows images[1..].
    expect(screen.queryByRole('img', { name: fixture.images![0].alt })).not.toBeInTheDocument();
    expect(screen.getByRole('img', { name: fixture.images![1].alt })).toBeInTheDocument();
    expect(screen.getByRole('img', { name: fixture.images![2].alt })).toBeInTheDocument();
  });

  it('renders captions for gallery images that have them', () => {
    render(<CaseGallery images={fixture.images} />);
    expect(screen.getByText('Feed')).toBeInTheDocument();
    // 3rd image has no caption.
    expect(screen.queryByText('Cover')).not.toBeInTheDocument();
  });

  it('renders a "More screens" labelled section', () => {
    render(<CaseGallery images={fixture.images} />);
    const region = screen.getByRole('region', { name: 'More screens' });
    expect(region).toBeInTheDocument();
    expect(within(region).getByRole('heading', { level: 2, name: 'More screens' })).toBeInTheDocument();
  });

  it('renders nothing when there is only a cover image (no rest)', () => {
    const { container } = render(<CaseGallery images={[fixture.images![0]]} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders nothing when images is undefined', () => {
    const { container } = render(<CaseGallery images={undefined} />);
    expect(container).toBeEmptyDOMElement();
  });
});
