import type { CaseStudy } from '@/data/work';
import UnderlineLink from '@/components/motion/UnderlineLink';

/**
 * Case-study hero: a mono meta strip ({role} · {year} + IN PROGRESS when set),
 * an oversized display title, the one-line summary, mono tech tags, and any
 * external links rendered as UnderlineLinks. Links render nothing when absent.
 */
export default function CaseHero({ c }: { c: CaseStudy }) {
  return (
    <header className="py-[clamp(2.5rem,8vh,5rem)]">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <span className="mono-label text-muted">
          {c.role} · {c.year}
        </span>
        {c.inProgress && (
          <span className="rounded-full border border-accent bg-accent px-[11px] py-[5px] font-mono text-[10px] uppercase tracking-[0.1em] text-base">
            In progress
          </span>
        )}
      </div>

      <h1 className="mt-5 font-display font-semibold leading-[0.98] tracking-[-0.02em] text-ink text-[clamp(2.5rem,9vw,6rem)]">
        {c.title}
      </h1>

      <p className="measure mt-6 text-[clamp(1rem,2vw,1.3125rem)] font-medium leading-relaxed text-muted">
        {c.summary}
      </p>

      <ul className="mt-7 flex flex-wrap gap-1.5">
        {c.tech.map((t) => (
          <li
            key={t}
            className="rounded-full border border-white/10 px-[11px] py-[5px] font-mono text-[10px] uppercase tracking-[0.1em] text-muted"
          >
            {t}
          </li>
        ))}
      </ul>

      {c.links && c.links.length > 0 && (
        <div className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-3">
          {c.links.map((link) => (
            <UnderlineLink
              key={link.href}
              href={link.href}
              target="_blank"
              rel="noreferrer"
              className="font-mono text-xs uppercase tracking-[0.12em]"
            >
              {link.label} ↗
            </UnderlineLink>
          ))}
        </div>
      )}
    </header>
  );
}
