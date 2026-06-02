'use client';

import Link from 'next/link';
import type { ComponentProps, ReactNode } from 'react';

type UnderlineLinkProps = {
  href: ComponentProps<typeof Link>['href'];
  children: ReactNode;
  className?: string;
} & Omit<ComponentProps<typeof Link>, 'href' | 'className' | 'children'>;

/**
 * Text link with an acid-lime underline that wipes in from the left on hover
 * and keyboard focus (`focus-visible`).
 *
 * The underline is a `::after` pseudo-element scaled via a CSS transition, so
 * it automatically becomes instant under the global `prefers-reduced-motion`
 * backstop in `globals.css`. Text stays `ink`; the underline is `accent`.
 */
export default function UnderlineLink({
  href,
  children,
  className,
  ...rest
}: UnderlineLinkProps) {
  return (
    <Link
      href={href}
      className={`group relative inline-block text-ink no-underline after:absolute after:-bottom-0.5 after:left-0 after:h-px after:w-full after:origin-left after:scale-x-0 after:bg-accent after:transition-transform after:duration-300 after:ease-[cubic-bezier(0.16,1,0.3,1)] after:content-[''] hover:after:scale-x-100 focus-visible:outline-none focus-visible:after:scale-x-100 ${className ?? ''}`.trim()}
      {...rest}
    >
      {children}
    </Link>
  );
}
