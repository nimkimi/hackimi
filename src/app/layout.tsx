import Header from '@/components/Header';
import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Nima Hakimi',
  description: 'Welcome to my website',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="font-sans text-light-text dark:text-dark-text bg-light-background dark:bg-dark-background">
        {' '}
        <Header />
        <main>{children}</main>
      </body>
    </html>
  );
}
