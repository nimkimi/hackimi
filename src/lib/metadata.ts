import type { Metadata } from 'next';
import {
  SITE_AUTHOR,
  SITE_DESCRIPTION,
  SITE_EMAIL,
  SITE_EMPLOYER,
  SITE_KEYWORDS,
  SITE_LOCATION,
  SITE_OG_IMAGE,
  SITE_ROLE,
  SITE_SOCIAL_LINKS,
  SITE_TITLE,
  SITE_URL,
} from './site';

export const METADATA_BASE = new URL(SITE_URL);

const defaultImage = {
  url: SITE_OG_IMAGE,
  width: 1200,
  height: 630,
  alt: `${SITE_AUTHOR} portfolio preview`,
};

const defaultTwitterImage = SITE_OG_IMAGE;

const defaultKeywords = [...SITE_KEYWORDS];

type OgImage =
  | string
  | {
      url: string;
      width?: number;
      height?: number;
      alt?: string;
    };

type PageMetadataOptions = {
  title: string;
  description: string;
  path?: string;
  keywords?: string[];
  ogImage?: OgImage;
};

function resolveUrl(path?: string) {
  if (!path || path === '/' || path === SITE_URL) {
    return SITE_URL;
  }
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return new URL(normalized, SITE_URL).toString();
}

function toOgImage(image?: OgImage) {
  if (!image) {
    return defaultImage;
  }
  if (typeof image === 'string') {
    return {
      url: image,
      width: 1200,
      height: 630,
      alt: `${SITE_AUTHOR} portfolio image`,
    };
  }
  return { alt: `${SITE_AUTHOR} portfolio image`, width: 1200, height: 630, ...image };
}

function mergeKeywords(extra?: string[]) {
  if (!extra || extra.length === 0) {
    return defaultKeywords;
  }
  const merged = new Set([...defaultKeywords, ...extra]);
  return Array.from(merged);
}

export function buildRootMetadata(): Metadata {
  return {
    metadataBase: METADATA_BASE,
    title: {
      default: SITE_TITLE,
      template: `%s | ${SITE_AUTHOR}`,
    },
    description: SITE_DESCRIPTION,
    keywords: defaultKeywords,
    authors: [{ name: SITE_AUTHOR, url: SITE_URL }],
    creator: SITE_AUTHOR,
    publisher: SITE_AUTHOR,
    category: 'Technology',
    openGraph: {
      title: SITE_TITLE,
      description: SITE_DESCRIPTION,
      url: SITE_URL,
      siteName: SITE_AUTHOR,
      type: 'website',
      images: [defaultImage],
    },
    twitter: {
      card: 'summary_large_image',
      title: SITE_TITLE,
      description: SITE_DESCRIPTION,
      images: [defaultTwitterImage],
    },
    alternates: {
      canonical: SITE_URL,
    },
  };
}

export function buildPageMetadata({ title, description, path, keywords, ogImage }: PageMetadataOptions): Metadata {
  const canonical = resolveUrl(path);
  const resolvedImage = toOgImage(ogImage);
  const titleWithSuffix = `${title} | ${SITE_AUTHOR}`;

  return {
    title,
    description,
    keywords: mergeKeywords(keywords),
    alternates: {
      canonical,
    },
    openGraph: {
      title: titleWithSuffix,
      description,
      url: canonical,
      siteName: SITE_AUTHOR,
      type: 'website',
      images: [resolvedImage],
    },
    twitter: {
      card: 'summary_large_image',
      title: titleWithSuffix,
      description,
      images: [resolvedImage.url],
    },
  };
}

export function buildPersonJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    'name': SITE_AUTHOR,
    'url': SITE_URL,
    'jobTitle': SITE_ROLE,
    'worksFor': {
      '@type': 'Organization',
      'name': SITE_EMPLOYER.name,
    },
    'address': {
      '@type': 'PostalAddress',
      'addressLocality': SITE_LOCATION.city,
      'addressCountry': SITE_LOCATION.country,
    },
    'email': `mailto:${SITE_EMAIL}`,
    'image': SITE_OG_IMAGE,
    'sameAs': [SITE_SOCIAL_LINKS.github, SITE_SOCIAL_LINKS.linkedin],
  } as const;
}

export { resolveUrl };
