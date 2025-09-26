import Header from '@/components/Header';
import './globals.css';
import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Nima Hakimi',
  description: 'Welcome to my website',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#FFFFFF' },
    { media: '(prefers-color-scheme: dark)', color: '#1A202C' },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen font-sans text-light-text dark:text-dark-text bg-light-background dark:bg-dark-background">
        <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
          <div className="absolute left-1/2 top-[-10%] h-[60vmax] w-[60vmax] -translate-x-1/2 rounded-full bg-gradient-to-tr from-light-accent/30 to-transparent dark:from-dark-accent/25 blur-3xl" />
          <div className="absolute right-[-10%] bottom-[-10%] h-[40vmax] w-[40vmax] rounded-full bg-gradient-to-tr from-light-accent/10 to-transparent dark:from-dark-accent/10 blur-3xl" />
        </div>
        <Header />
        <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">{children}</main>
      </body>
    </html>
  );
}
