import type { CaseImage } from '@/data/work';
import Reveal from '@/components/motion/Reveal';
import CaseFigure from '@/components/work/CaseFigure';

/**
 * The visual presentation for a case study that ships real UI:
 *  - a prominent full-width cover (the first image), shown right after the hero;
 *  - the remaining screenshots in a responsive 2-up gallery lower down.
 *
 * Renders nothing when a case has no images, so text-only cases (e.g. an
 * internal tool with no public mockup) degrade gracefully. Each entrance is a
 * masked Reveal, which the global reduced-motion backstop renders statically.
 */
export function CaseCover({ images }: { images?: CaseImage[] }) {
  const cover = images?.[0];
  if (!cover) return null;

  return (
    <Reveal className="mt-[clamp(0.5rem,3vh,1.5rem)]">
      <CaseFigure image={cover} sizes="(min-width: 1024px) 880px, 100vw" priority />
    </Reveal>
  );
}

export function CaseGallery({ images }: { images?: CaseImage[] }) {
  const rest = images?.slice(1) ?? [];
  if (rest.length === 0) return null;

  return (
    <section
      aria-label="More screens"
      className="mt-[clamp(2rem,6vh,3.5rem)] border-t border-white/10 pt-[clamp(2rem,6vh,3.5rem)]"
    >
      <Reveal>
        <h2 className="mono-label text-muted">More screens</h2>
      </Reveal>
      <div className="mt-7 grid gap-x-[clamp(16px,3vw,28px)] gap-y-[clamp(2rem,5vh,3rem)] sm:grid-cols-2">
        {rest.map((image, i) => (
          <Reveal key={image.src} delay={i * 0.06}>
            <CaseFigure image={image} sizes="(min-width: 640px) 50vw, 100vw" />
          </Reveal>
        ))}
      </div>
    </section>
  );
}
