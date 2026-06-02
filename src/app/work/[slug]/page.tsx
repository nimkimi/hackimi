import { notFound } from 'next/navigation';
import { buildPageMetadata } from '@/lib/metadata';
import Reveal from '@/components/motion/Reveal';
import UnderlineLink from '@/components/motion/UnderlineLink';
import CaseHero from '@/components/work/CaseHero';
import CaseSection from '@/components/work/CaseSection';
import work from '@/data/work';

export function generateStaticParams() {
  return work.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const c = work.find((w) => w.slug === slug);
  if (!c) return {};
  return buildPageMetadata({
    title: c.title,
    description: c.summary,
    path: `/work/${slug}`,
  });
}

export default async function CasePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const c = work.find((w) => w.slug === slug);
  if (!c) notFound();

  // Sibling case for a "Next project" pointer at the foot.
  const currentIndex = work.findIndex((w) => w.slug === slug);
  const next = work[(currentIndex + 1) % work.length];

  return (
    <article className="pb-[clamp(3rem,10vh,7rem)]">
      <div className="pt-[clamp(1.5rem,5vh,3rem)]">
        <UnderlineLink
          href="/work"
          className="font-mono text-xs uppercase tracking-[0.12em] text-muted"
        >
          ← All work
        </UnderlineLink>
      </div>

      <CaseHero c={c} />

      <div className="mt-[clamp(1rem,4vh,2.5rem)]">
        {c.sections.map((section, index) => (
          <CaseSection key={section.heading} section={section} index={index} />
        ))}
      </div>

      {/* Foot: back + next project */}
      <Reveal className="mt-[clamp(3rem,8vh,5rem)] border-t border-white/10 pt-10">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <UnderlineLink
            href="/work"
            className="font-mono text-xs uppercase tracking-[0.12em] text-muted"
          >
            ← Back to work
          </UnderlineLink>
          {next.slug !== c.slug && (
            <div className="sm:text-right">
              <span className="mono-label block">Next project</span>
              <UnderlineLink
                href={`/work/${next.slug}`}
                className="mt-2 inline-block font-display text-[clamp(1.5rem,4vw,2.5rem)] font-semibold leading-none tracking-[-0.02em]"
              >
                {next.title}
              </UnderlineLink>
            </div>
          )}
        </div>
      </Reveal>
    </article>
  );
}
