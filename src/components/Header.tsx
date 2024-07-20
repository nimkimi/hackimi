'use client';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import '@/app/globals.css';

export default function Header() {
  const pathname = usePathname();

  return (
    <nav className="flex w-full justify-between dark:bg-bg-dark items-center bg-bg-light py-4 px-6">
      <Link
        href="/"
        className="text-lg font-bold text-text-light dark:text-text-dark"
      >
        N.HAKIMI
      </Link>
      <div className="flex space-x-4">
        <Link
          href="/about"
          className={`${
            pathname === '/about'
              ? 'bg-gray-900 text-white'
              : 'text-text-light dark:text-text-dark'
          } px-3 py-2 rounded-md text-sm font-medium transition-colors duration-300`}
        >
          About
        </Link>
        <Link
          href="/projects"
          className={`${
            pathname === '/projects'
              ? 'bg-gray-900 text-white'
              : 'text-text-light dark:text-text-dark'
          } px-3 py-2 rounded-md text-sm font-medium transition-colors duration-300`}
        >
          Projects
        </Link>
        <Link
          href="/contact"
          className={`${
            pathname === '/contact'
              ? 'bg-dark text-dark dark:bg-light dark:text-light'
              : 'text-light dark:text-dark'
          } px-3 py-2 rounded-md text-sm font-medium transition-colors duration-300`}
        >
          Contact
        </Link>
      </div>
    </nav>
  );
}
