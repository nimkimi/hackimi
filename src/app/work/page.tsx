import { buildPageMetadata } from '@/lib/metadata';
import Reveal from '@/components/motion/Reveal';
import WorkRow from '@/components/work/WorkRow';
import work from '@/data/work';

export const metadata = buildPageMetadata({
  title: 'Work',
  description: 'Selected engineering work by Nima Hakimi.',
  path: '/work',
});

export default function WorkPage() {
  return (
    <section className="py-[clamp(3rem,10vh,7rem)]">
      <Reveal>
        <h1 className="mono-label">Selected Work</h1>
      </Reveal>
      <Reveal delay={0.05}>
        <p className="measure mt-4 text-[clamp(1.125rem,2.4vw,1.625rem)] font-medium leading-snug text-ink">
          Case studies in product engineering — design and build, end to end.
        </p>
      </Reveal>

      <div className="work-list mt-[clamp(2rem,6vh,4rem)] border-t border-white/10">
        {work.map((c, index) => (
          <Reveal key={c.slug} delay={index * 0.05}>
            <WorkRow c={c} index={index} />
          </Reveal>
        ))}
      </div>
    </section>
  );
}
