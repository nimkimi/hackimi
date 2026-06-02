import { buildPageMetadata } from '@/lib/metadata';
import Reveal from '@/components/motion/Reveal';
import MagneticButton from '@/components/motion/MagneticButton';
import UnderlineLink from '@/components/motion/UnderlineLink';
import WorkRow from '@/components/work/WorkRow';
import work from '@/data/work';

export const metadata = buildPageMetadata({
  title: 'Portfolio',
  description:
    'Discover the work, skills, and contact information of frontend developer Nima Hakimi.',
  path: '/',
});

export default function Home() {
  return (
    <>
      <section
        id="top"
        className="relative flex min-h-[88svh] flex-col justify-center py-24"
      >
        {/* Eyebrow */}
        <div className="mb-[clamp(1.25rem,4vh,2.5rem)] flex items-center gap-3">
          <span aria-hidden className="h-px w-7 bg-accent" />
          <span className="mono-label text-accent">Frontend Developer</span>
        </div>

        {/* Name headline — masked reveal target lives in `data-hero-line` */}
        <h1
          className="font-display font-bold tracking-tight leading-[1.02]"
          style={{ fontSize: 'clamp(2.75rem, 9vw, 7rem)' }}
        >
          <span className="block overflow-hidden">
            <span data-hero-line className="block will-change-transform">
              Nima Hakimi
              <span id="name-period" className="inline-block text-accent">
                .
              </span>
            </span>
          </span>
        </h1>

        {/* Positioning line */}
        <Reveal delay={0.1} className="mt-[clamp(1.5rem,5vh,3rem)]">
          <p className="measure text-[clamp(1rem,2.1vw,1.3125rem)] font-medium leading-relaxed text-muted">
            <span className="text-ink">Frontend developer</span> with a{' '}
            <span className="text-ink">designer&rsquo;s eye</span> — I build{' '}
            <span className="text-ink">accessible</span>,{' '}
            <span className="text-ink">expressive</span> interfaces for the web.
            Currently at <span className="text-accent">NAV</span>.
          </p>
        </Reveal>

        {/* CTA row */}
        <Reveal delay={0.2} className="mt-[clamp(2rem,7vh,3.5rem)]">
          <div className="flex flex-wrap items-center gap-x-8 gap-y-4">
            <MagneticButton href="#work">View work</MagneticButton>
            <UnderlineLink href="#contact">Get in touch</UnderlineLink>
            <UnderlineLink
              href="https://github.com/nimkimi"
              target="_blank"
              rel="noreferrer"
              className="text-muted"
            >
              GitHub
            </UnderlineLink>
          </div>
        </Reveal>

        {/* Scroll cue */}
        <div
          aria-hidden
          className="pointer-events-none absolute bottom-6 right-0 hidden items-center gap-3 sm:flex"
        >
          <span className="mono-label">Scroll</span>
          <span className="relative h-9 w-px overflow-hidden bg-white/15">
            <span className="absolute left-0 top-0 h-full w-px animate-scroll-cue bg-accent" />
          </span>
        </div>
      </section>

      {/* Selected Work */}
      <section id="work" className="scroll-mt-24 py-24">
        <Reveal>
          <h2 className="mono-label">Selected Work</h2>
        </Reveal>

        <div className="work-list mt-2 border-t border-white/10">
          {work.map((c, index) => (
            <Reveal key={c.slug} delay={index * 0.05}>
              <WorkRow c={c} index={index} />
            </Reveal>
          ))}
        </div>

        <div className="mt-12">
          <UnderlineLink
            href="/work"
            className="font-mono text-xs uppercase tracking-[0.12em]"
          >
            All work →
          </UnderlineLink>
        </div>
      </section>

      {/* Anchor placeholders — filled by later tasks */}
      <section id="playground" className="scroll-mt-24 py-24">
        <h2 className="mono-label">Playground</h2>
      </section>
      <section id="contact" className="scroll-mt-24 py-24">
        <h2 className="mono-label">Get in touch</h2>
      </section>
    </>
  );
}
