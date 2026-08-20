import Reveal from '@/components/motion/Reveal';
import MagneticButton from '@/components/motion/MagneticButton';
import UnderlineLink from '@/components/motion/UnderlineLink';

export const metadata = { title: 'Not found' };

/**
 * On-brand 404 for unknown routes and notFound() calls. Before this existed a
 * dead link landed on Next's unstyled default — a white page on a dark site.
 */
export default function NotFound() {
  return (
    <section className="flex min-h-[70svh] flex-col justify-center py-24">
      <Reveal>
        <div className="mb-[clamp(1.25rem,4vh,2.25rem)] flex items-center gap-3">
          <span aria-hidden className="h-px w-7 bg-accent" />
          <span className="mono-label text-accent">404</span>
        </div>
      </Reveal>

      <h1
        className="font-display font-bold leading-[1.04] tracking-tight"
        style={{ fontSize: 'clamp(2.25rem, 6.5vw, 4.5rem)' }}
      >
        <span className="block overflow-hidden">
          <Reveal>This page doesn’t exist.</Reveal>
        </span>
      </h1>

      <Reveal delay={0.1} className="mt-[clamp(1.5rem,5vh,2.5rem)]">
        <p className="measure text-[clamp(1rem,2vw,1.25rem)] leading-relaxed text-muted">
          The link is stale, or the address is off. Everything that does exist is a step away.
        </p>
      </Reveal>

      <Reveal delay={0.2} className="mt-[clamp(1.75rem,6vh,2.75rem)]">
        <div className="flex flex-wrap items-center gap-x-8 gap-y-4">
          <MagneticButton href="/">Back home</MagneticButton>
          <UnderlineLink href="/work" className="font-mono text-xs uppercase tracking-[0.12em] text-muted">
            All work →
          </UnderlineLink>
        </div>
      </Reveal>
    </section>
  );
}
