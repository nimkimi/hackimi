import Reveal from '@/components/motion/Reveal';
import SegmentedControl from './SegmentedControl';
import SpringSlider from './SpringSlider';
import CopyChip from './CopyChip';

type Demo = {
  caption: string;
  node: React.ReactNode;
};

const demos: Demo[] = [
  { caption: 'Segmented control', node: <SegmentedControl /> },
  { caption: 'Spring slider', node: <SpringSlider /> },
  { caption: 'Copy chip', node: <CopyChip /> },
];

/**
 * Frames a few genuinely interactive component demos — the "I sweat the
 * details" proof. Hairline separation, no heavy cards. Each demo is a
 * self-contained client island wrapped in a staggered Reveal.
 */
export default function PlaygroundSection() {
  return (
    <>
      <Reveal>
        <h2 className="mono-label">Playground</h2>
      </Reveal>
      <Reveal delay={0.05}>
        <p className="measure mt-4 text-[clamp(1.125rem,2.4vw,1.625rem)] font-medium leading-snug text-ink">
          Small interactions, built to feel right.
        </p>
      </Reveal>

      <div className="mt-[clamp(2rem,6vh,4rem)] grid border-t border-white/10 lg:grid-cols-3">
        {demos.map((demo, i) => (
          <Reveal
            key={demo.caption}
            delay={i * 0.06}
            className="border-b border-white/10 lg:border-b-0 lg:border-r lg:last:border-r-0"
          >
            <div className="flex min-h-[12rem] flex-col justify-between gap-6 py-8 lg:px-8 lg:first:pl-0 lg:last:pr-0">
              <div className="flex flex-1 items-center">{demo.node}</div>
              <p className="mono-label">{demo.caption}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </>
  );
}
