type Props = { className?: string; title?: string };

/**
 * NH monogram — a balanced, geometric mark built entirely from strokes.
 *
 * Stroke-only (`fill="none"`, `currentColor`) so it can either sit static as the
 * logo or "draw on" via `stroke-dashoffset` during the arrival animation.
 * Color is inherited from `currentColor`, letting callers swap between the
 * off-white resting state and the acid-lime arrival pop.
 *
 * Geometry: 120×120 viewBox, strokeWidth 8. All four verticals share the same
 * top/bottom (y 20→100) so the N and H align on a common baseline and cap line.
 * The N sits in the left half, the H in the right, with a consistent 12px gap
 * between the N's trailing stem and the H's leading stem to keep the rhythm even.
 */
export default function Monogram({ className, title = 'Nima Hakimi' }: Props) {
  return (
    <svg
      viewBox="0 0 120 120"
      className={className}
      role="img"
      aria-label={title}
      fill="none"
      stroke="currentColor"
      strokeWidth={8}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* N — left stem, diagonal, right stem (single continuous path) */}
      <path d="M20 100 L20 20 L54 100 L54 20" />
      {/* H — left stem, crossbar, right stem */}
      <path d="M66 20 L66 100 M66 60 L100 60 M100 20 L100 100" />
    </svg>
  );
}
