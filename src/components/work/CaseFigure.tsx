import Image from 'next/image';
import type { CaseImage } from '@/data/work';

/**
 * A single framed case-study screenshot: a hairline-bordered, rounded image
 * (no heavy shadow) over a mono caption. Matches the dark `#0E0E10` system.
 *
 * Images are captured at 1280×800; we pass that as the intrinsic size and let
 * `h-auto w-full` scale them responsively. `priority` opts the cover image out
 * of lazy-loading; everything else lazy-loads (next/image default).
 */
export default function CaseFigure({
  image,
  sizes,
  priority = false,
}: {
  image: CaseImage;
  sizes: string;
  priority?: boolean;
}) {
  return (
    <figure>
      <div className="overflow-hidden rounded-md border border-white/10 bg-[#141417]">
        <Image
          src={image.src}
          alt={image.alt}
          width={1280}
          height={800}
          sizes={sizes}
          priority={priority}
          className="h-auto w-full"
        />
      </div>
      {image.caption && (
        <figcaption className="mono-label mt-3 text-muted">{image.caption}</figcaption>
      )}
    </figure>
  );
}
