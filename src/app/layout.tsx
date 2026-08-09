import Preloader from '@/components/intro/Preloader';
import SiteFooter from '@/components/layout/SiteFooter';
import SiteNav from '@/components/layout/SiteNav';
import SmoothScroll from '@/components/motion/SmoothScroll';
import JsonLd from '@/components/seo/JsonLd';
import './globals.css';
import type { Viewport } from 'next';
import { clashDisplay, satoshi, geistMono } from '@/styles/fonts';
import { buildPersonJsonLd, buildRootMetadata, buildWebSiteJsonLd } from '@/lib/metadata';

export const metadata = buildRootMetadata();

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0E0E10',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${clashDisplay.variable} ${satoshi.variable} ${geistMono.variable}`}>
      <body className="min-h-screen bg-dark text-ink font-sans">
        <Preloader />
        <JsonLd data={buildPersonJsonLd()} />
        <JsonLd data={buildWebSiteJsonLd()} />
        <div className="grain" aria-hidden />
        <SmoothScroll>
          <SiteNav />
          <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">{children}</main>
          <SiteFooter />
        </SmoothScroll>
      </body>
    </html>
  );
}
