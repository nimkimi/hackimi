'use client';

import Link from 'next/link';
import { useEffect, useMemo, useRef } from 'react';
import { usePathname } from 'next/navigation';
import type { NavLink } from './types';

const normalize = (path: string | null) => {
  if (!path) return '/';
  if (path.length > 1 && path.endsWith('/')) {
    return path.replace(/\/+$/, '') || '/';
  }
  return path;
};

const isActive = (pathname: string, href: string) => {
  if (href === '/') {
    return pathname === '/';
  }
  return pathname === href || pathname.startsWith(`${href}/`);
};

export type NavLinksClientProps = {
  links: NavLink[];
  variant: 'desktop' | 'mobile';
  baseClass: string;
  activeClass: string;
  inactiveClass: string;
  containerClass: string;
};

export default function NavLinksClient({
  links,
  variant,
  baseClass,
  activeClass,
  inactiveClass,
  containerClass,
}: NavLinksClientProps) {
  const rawPathname = usePathname();
  const pathname = useMemo(() => normalize(rawPathname), [rawPathname]);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (variant !== 'mobile') return;
    const details = containerRef.current?.closest('details');
    if (details?.hasAttribute('open')) {
      details.removeAttribute('open');
    }
  }, [pathname, variant]);

  return (
    <div ref={containerRef} className={containerClass}>
      {links.map((link) => {
        const normalizedHref = normalize(link.href);
        const selected = isActive(pathname, normalizedHref);
        return (
          <Link
            key={link.href}
            href={link.href}
            prefetch={variant === 'mobile' ? false : undefined}
            aria-current={selected ? 'page' : undefined}
            className={`${baseClass} ${selected ? activeClass : inactiveClass}`}
          >
            {link.label}
          </Link>
        );
      })}
    </div>
  );
}
