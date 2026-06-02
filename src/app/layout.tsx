import Preloader from '@/components/intro/Preloader';
import SiteNav from '@/components/layout/SiteNav';
import SmoothScroll from '@/components/motion/SmoothScroll';
import './globals.css';
import type { Viewport } from 'next';
import { clashDisplay, satoshi, geistMono } from '@/styles/fonts';
import { buildPersonJsonLd, buildRootMetadata } from '@/lib/metadata';

export const metadata = buildRootMetadata();

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0E0E10',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const jsonLd = buildPersonJsonLd();

  return (
    <html
      lang="en"
      className={`${clashDisplay.variable} ${satoshi.variable} ${geistMono.variable}`}
    >
      <body className="min-h-screen bg-base text-ink font-sans">
        <Preloader />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
          suppressHydrationWarning
        />
        <div className="grain" aria-hidden />
        <SmoothScroll>
          <SiteNav />
          <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">{children}</main>
        </SmoothScroll>
      </body>
    </html>
  );
}
