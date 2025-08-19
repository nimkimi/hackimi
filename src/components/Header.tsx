'use client';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Sparkles, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const links = [
    { href: '/about', label: 'About' },
    { href: '/projects', label: 'Projects' },
    { href: '/contact', label: 'Contact' },
  ];

  const isActive = (path: string) => pathname === path || pathname?.startsWith(path + '/');

  return (
    <nav className="sticky top-0 z-50 safe-top">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="my-3 flex items-center justify-between rounded-2xl bg-white/50 dark:bg-black/30 backdrop-blur-xl ring-1 ring-black/10 dark:ring-white/10 px-4 sm:px-6 py-2 shadow-sm">
          <Link href="/" className="relative inline-flex items-center gap-2">
            <span className="rounded-full bg-light-accent/15 dark:bg-dark-accent/20 p-1">
              <Sparkles className="h-4 w-4 text-light-accent dark:text-dark-accent" />
            </span>
            <span className="text-lg font-extrabold tracking-tight bg-clip-text text-transparent bg-[linear-gradient(110deg,theme(colors.light.primary)_0%,theme(colors.light.accent)_40%,theme(colors.light.primary)_80%)] dark:bg-[linear-gradient(110deg,theme(colors.dark.primary)_0%,theme(colors.dark.accent)_40%,theme(colors.dark.primary)_80%)] bg-[length:200%_100%] hover:animate-[shimmer_2.5s_linear_infinite]">
              N.HAKIMI
            </span>
          </Link>

          <div className="relative hidden md:flex items-center gap-2 rounded-xl p-1">
            {links.map((l) => {
              const base = 'btn';
              const active = 'btn-accent';
              const inactive = 'btn-outline';
              return (
                <Link key={l.href} href={l.href} className={`${base} ${isActive(l.href) ? active : inactive}`}>
                  {l.label}
                </Link>
              );
            })}
          </div>

          <button
            type="button"
            aria-label="Open navigation menu"
            aria-expanded={open}
            aria-controls="mobile-nav"
            onClick={() => setOpen((v) => !v)}
            className="md:hidden btn btn-outline px-3 py-2"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        <AnimatePresence>
          {open && (
            <motion.div
              id="mobile-nav"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
              className="-mt-2 mb-3 rounded-2xl bg-white/70 dark:bg-black/40 backdrop-blur-xl ring-1 ring-black/10 dark:ring-white/10 p-3 md:hidden"
            >
              <div className="grid grid-cols-1 gap-2">
                {links.map((l) => {
                  const base = 'btn w-full justify-center';
                  const active = 'btn-accent';
                  const inactive = 'btn-outline';
                  return (
                    <Link
                      key={l.href}
                      href={l.href}
                      onClick={() => setOpen(false)}
                      className={`${base} ${isActive(l.href) ? active : inactive}`}
                    >
                      {l.label}
                    </Link>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
}
