'use client';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

export default function Header() {
  const pathname = usePathname();

  const linkStyles = (path: string) => {
    return `${
      pathname === path
        ? 'bg-light-primary text-dark-text dark:bg-dark-primary dark:text-light-text border-light-accent dark:border-dark-accent'
        : 'bg-dark-primary text-light-text dark:text-dark-text dark:bg-light-primary border-dark-accent dark:border-light-accent'
    } px-3 py-2 rounded-md text-sm font-medium transition-colors duration-300 border-2`;
  };

  return (
    <nav className="flex w-full justify-between dark:bg-dark items-center bg-light py-1 px-6">
      <Link href="/" className="text-lg font-bold">
        N.HAKIMI
      </Link>
      <div className="flex space-x-4">
        <Link href="/about" className={linkStyles('/about')}>
          About
        </Link>
        <Link href="/projects" className={linkStyles('/projects')}>
          Projects
        </Link>
        <Link href="/contact" className={linkStyles('/contact')}>
          Contact
        </Link>
      </div>
    </nav>
  );
}
