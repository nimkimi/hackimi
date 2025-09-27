import Link from 'next/link';
import { IconMenu2, IconX } from '@tabler/icons-react';
import NavLinks from './NavLinks';
import type { NavLink } from './navigation/types';

const links: NavLink[] = [
  { href: '/about', label: 'About' },
  { href: '/projects', label: 'Projects' },
  { href: '/contact', label: 'Contact' },
];

export default function Header() {
  return (
    <nav className="sticky top-0 z-50 safe-top">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="my-3 rounded-2xl bg-white/50 dark:bg-black/30 backdrop-blur-xl ring-1 ring-black/10 dark:ring-white/10 px-4 sm:px-6 py-2 shadow-sm relative">
          <div className="flex items-center justify-between gap-3">
            <Link href="/" className="relative inline-flex items-center">
              <span className="text-lg font-extrabold tracking-tight bg-clip-text text-transparent bg-[linear-gradient(110deg,theme(colors.light.primary)_0%,theme(colors.light.accent)_40%,theme(colors.light.primary)_80%)] dark:bg-[linear-gradient(110deg,theme(colors.dark.primary)_0%,theme(colors.dark.accent)_40%,theme(colors.dark.primary)_80%)] bg-[length:200%_100%] hover:animate-[shimmer_2.5s_linear_infinite]">
                N.HAKIMI
              </span>
            </Link>

            <NavLinks links={links} variant="desktop" />

            <details className="md:hidden ml-auto group">
              <summary className="flex justify-end list-none cursor-pointer select-none [&::marker]:hidden [&::-webkit-details-marker]:hidden">
                <span className="btn btn-outline px-3 py-2 inline-flex items-center gap-2">
                  <IconMenu2 size={20} aria-hidden="true" className="group-open:hidden" />
                  <IconX size={20} aria-hidden="true" className="hidden group-open:block" />
                  <span className="sr-only">Menu</span>
                </span>
              </summary>
              <NavLinks links={links} variant="mobile" />
            </details>
          </div>
        </div>
      </div>
    </nav>
  );
}
