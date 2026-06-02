import Link from 'next/link';
import Image from 'next/image';
import type { CaseStudy } from '@/data/work';

/**
 * An expressive, hairline-separated row (not a card) linking to a case study.
 *
 * Layout: mono index · title (font-display) · one-line summary · mono tech tags
 * (+ an IN PROGRESS tag when flagged), with a tasteful gradient preview tile
 * that reveals on hover/focus on desktop.
 *
 * Interactions are scoped to fine pointers via `[@media(hover:hover)]` and ride
 * CSS transitions, so they degrade to instant under `prefers-reduced-motion`
 * (handled by the global backstop) and stay inert on touch. The whole row is a
 * single focusable link with a visible focus ring and an aria-label.
 *
 * Sibling dimming is owned by the list container (`.work-list`): on hover it
 * fades every row to 0.4 and lifts the hovered one back to full opacity.
 */
export default function WorkRow({ c, index }: { c: CaseStudy; index: number }) {
  const num = String(index + 1).padStart(2, '0');
  // Keep the row visually focused but uncluttered: a few representative tags.
  const tags = c.tech.slice(0, 4);
  // Use the real cover screenshot in the hover preview when the case has one.
  const cover = c.images?.[0];

  return (
    <Link
      href={`/work/${c.slug}`}
      aria-label={`View case study: ${c.title}`}
      className="work-row group relative grid grid-cols-[auto_1fr] items-center gap-x-4 gap-y-2 border-b border-white/10 py-[clamp(1.6rem,4vh,2.6rem)] outline-none transition-opacity duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] sm:grid-cols-[auto_1fr_auto] sm:gap-x-[clamp(14px,3vw,40px)]"
    >
      {/* visible focus ring on keyboard focus */}
      <span
        aria-hidden
        className="pointer-events-none absolute -inset-x-2 inset-y-1 rounded-md ring-2 ring-accent/0 transition-[--tw-ring-color] duration-200 group-focus-visible:ring-accent/70"
      />

      <span className="self-start pt-2 font-mono text-xs tabular-nums tracking-[0.1em] text-muted">
        {num}
      </span>

      <span className="min-w-0">
        <span className="relative inline-block font-display font-semibold leading-none tracking-[-0.02em] text-ink text-[clamp(1.9rem,6vw,4.5rem)] work-row__name transition-[transform,color] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] after:absolute after:bottom-[0.06em] after:left-0 after:h-[0.06em] after:w-full after:origin-left after:scale-x-0 after:bg-accent after:transition-transform after:duration-500 after:ease-[cubic-bezier(0.16,1,0.3,1)] after:content-['']">
          {c.title}
        </span>

        <span className="mt-3.5 block max-w-[52ch] text-[clamp(0.875rem,1.7vw,1.0625rem)] font-medium text-muted">
          {c.summary}
        </span>

        <span className="mt-4 flex flex-wrap gap-1.5">
          {c.inProgress && (
            <span className="rounded-full border border-accent bg-accent px-[11px] py-[5px] font-mono text-[10px] uppercase tracking-[0.1em] text-base">
              In progress
            </span>
          )}
          {tags.map((t) => (
            <span
              key={t}
              className="rounded-full border border-white/10 px-[11px] py-[5px] font-mono text-[10px] uppercase tracking-[0.1em] text-muted"
            >
              {t}
            </span>
          ))}
        </span>
      </span>

      {/* Preview tile — desktop only, reveals on hover/focus. Decorative. */}
      <span
        aria-hidden
        className="work-row__preview relative hidden aspect-[4/3] w-[clamp(118px,16vw,230px)] justify-self-end overflow-hidden rounded-[10px] border border-white/10 bg-[linear-gradient(135deg,#1a1a1e,#101013)] opacity-0 [clip-path:inset(0_0_100%_0)] transition-[clip-path,opacity] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] sm:block"
      >
        {cover ? (
          <Image
            src={cover.src}
            alt=""
            width={1280}
            height={800}
            sizes="230px"
            className="absolute inset-0 h-full w-full object-cover object-top"
          />
        ) : (
          <>
            <span className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.06)_1px,transparent_1px)] bg-[size:22px_22px] opacity-50" />
            <span className="absolute bottom-3.5 left-3.5 h-7 w-7 rounded-full bg-accent opacity-80 blur-[2px]" />
            <span className="absolute inset-0 grid place-items-center px-3 text-center font-display text-[13px] font-bold uppercase leading-tight tracking-[0.05em] text-ink/[0.12]">
              {c.title}
            </span>
          </>
        )}
      </span>
    </Link>
  );
}
