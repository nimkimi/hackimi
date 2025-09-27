import Header from '@/components/Header';
import './globals.css';
import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

const siteUrl = 'https://hackimi.dev';
const personName = 'Nima Hakimi';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${personName} | Frontend Developer`,
    template: `%s | ${personName}`,
  },
  description:
    'Portfolio of Nima Hakimi, a frontend developer focused on accessible, high-performance web applications built with modern technologies.',
  keywords: ['Nima Hakimi', 'Frontend Developer', 'Next.js', 'React', 'Oslo'],
  authors: [{ name: personName, url: siteUrl }],
  creator: personName,
  publisher: personName,
  category: 'Technology',
  openGraph: {
    title: `${personName} | Frontend Developer`,
    description:
      'Explore the work of Nima Hakimi, a frontend developer crafting accessible and performant digital experiences.',
    url: siteUrl,
    siteName: personName,
    type: 'website',
    images: [
      {
        url: `${siteUrl}/bigSmile.JPEG`,
        width: 1200,
        height: 630,
        alt: `${personName} portfolio preview`,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${personName} | Frontend Developer`,
    description:
      'Explore the work of Nima Hakimi, a frontend developer crafting accessible and performant digital experiences.',
    images: [`${siteUrl}/bigSmile.JPEG`],
  },
  alternates: {
    canonical: siteUrl,
  },
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
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    'name': personName,
    'url': siteUrl,
    'jobTitle': 'Frontend Developer',
    'worksFor': {
      '@type': 'Organization',
      'name': 'NAV IT',
    },
    'address': {
      '@type': 'PostalAddress',
      'addressLocality': 'Oslo',
      'addressCountry': 'Norway',
    },
    'email': 'mailto:nima@hackimi.dev',
    'image': `${siteUrl}/bigSmile.JPEG`,
    'sameAs': ['https://github.com/nima-hakimi', 'https://linkedin.com/in/nima-hakimi-387716175'],
  } as const;

  return (
    <html lang="en">
      <body className="min-h-screen font-sans text-light-text dark:text-dark-text bg-light-background dark:bg-dark-background">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
          suppressHydrationWarning
        />
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
