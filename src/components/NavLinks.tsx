import NavLinksClient from './navigation/NavLinksClient';
import type { NavLink } from './navigation/types';

interface NavLinksProps {
  links: NavLink[];
  variant: 'desktop' | 'mobile';
}

export default function NavLinks({ links, variant }: NavLinksProps) {
  const containerClass =
    variant === 'desktop'
      ? 'relative hidden md:flex items-center gap-2 rounded-xl p-1'
      : 'group-open:animate-fade-in-up absolute inset-x-0 top-full mt-2 flex flex-col gap-2 rounded-2xl bg-white/70 dark:bg-black/40 backdrop-blur-xl ring-1 ring-black/10 dark:ring-white/10 p-3';

  const baseClass = variant === 'mobile' ? 'btn w-full justify-center' : 'btn';

  return (
    <NavLinksClient
      links={links}
      variant={variant}
      containerClass={containerClass}
      baseClass={baseClass}
      activeClass="btn-accent"
      inactiveClass="btn-outline"
    />
  );
}
