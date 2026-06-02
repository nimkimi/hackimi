import type { CaseSection as CaseSectionType } from '@/data/work';
import Reveal from '@/components/motion/Reveal';

/**
 * One narrative section of a case study: a mono number + heading
 * (e.g. `01 / CONTEXT`) above a body constrained to `.measure`, wrapped in a
 * masked Reveal. Pass the zero-based index for the number.
 */
export default function CaseSection({
  section,
  index,
}: {
  section: CaseSectionType;
  index: number;
}) {
  const num = String(index + 1).padStart(2, '0');

  return (
    <Reveal className="border-t border-white/10 py-[clamp(2rem,6vh,3.5rem)]">
      <div className="grid gap-x-[clamp(16px,4vw,56px)] gap-y-4 sm:grid-cols-[auto_1fr]">
        <h2 className="mono-label whitespace-nowrap text-muted sm:pt-1.5">
          {num} / {section.heading}
        </h2>
        <p className="measure text-[clamp(1rem,1.9vw,1.1875rem)] leading-relaxed text-ink/90">
          {section.body}
        </p>
      </div>
    </Reveal>
  );
}
