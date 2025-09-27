import Link from 'next/link';
import { headers } from 'next/headers';
import { IconMenu2, IconX } from '@tabler/icons-react';

const links = [
  { href: '/about', label: 'About' },
  { href: '/projects', label: 'Projects' },
  { href: '/contact', label: 'Contact' },
];

async function getCurrentPath() {
  const headerList = await headers();
  const invokePath = headerList.get('x-invoke-path');
  const matchedPath = headerList.get('x-matched-path');
  const nextUrl = headerList.get('next-url');

  if (invokePath) return invokePath;
  if (nextUrl) {
    try {
      return new URL(nextUrl).pathname;
    } catch {
      return nextUrl;
    }
  }
  if (matchedPath) return matchedPath;
  return '/';
}

function isActive(pathname: string, href: string) {
  if (href === '/') {
    return pathname === '/' || pathname === '';
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default async function Header() {
  const pathname = await getCurrentPath();

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

            <div className="relative hidden md:flex items-center gap-2 rounded-xl p-1">
              {links.map((l) => {
                const base = 'btn';
                const active = 'btn-accent';
                const inactive = 'btn-outline';
                const selected = isActive(pathname, l.href);
                return (
                  <Link
                    key={l.href}
                    href={l.href}
                    aria-current={selected ? 'page' : undefined}
                    className={`${base} ${selected ? active : inactive}`}
                  >
                    {l.label}
                  </Link>
                );
              })}
            </div>

            <details className="md:hidden ml-auto group">
              <summary className="flex justify-end list-none cursor-pointer select-none [&::marker]:hidden [&::-webkit-details-marker]:hidden">
                <span className="btn btn-outline px-3 py-2 inline-flex items-center gap-2">
                  <IconMenu2 size={20} aria-hidden="true" className="group-open:hidden" />
                  <IconX size={20} aria-hidden="true" className="hidden group-open:block" />
                  <span className="sr-only">Menu</span>
                </span>
              </summary>
              <div className="group-open:animate-fade-in-up absolute inset-x-0 top-full mt-2 flex flex-col gap-2 rounded-2xl bg-white/70 dark:bg-black/40 backdrop-blur-xl ring-1 ring-black/10 dark:ring-white/10 p-3">
                {links.map((l) => {
                  const base = 'btn w-full justify-center';
                  const active = 'btn-accent';
                  const inactive = 'btn-outline';
                  const selected = isActive(pathname, l.href);
                  return (
                    <Link
                      key={l.href}
                      href={l.href}
                      aria-current={selected ? 'page' : undefined}
                      className={`${base} ${selected ? active : inactive}`}
                    >
                      {l.label}
                    </Link>
                  );
                })}
              </div>
            </details>
          </div>
        </div>
      </div>
    </nav>
  );
}
