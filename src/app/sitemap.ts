import type { MetadataRoute } from 'next';
import work from '@/data/work';

const baseUrl = 'https://hackimi.dev';

const routes = [
  '/',
  '/about',
  '/work',
  '/contact',
  ...work.map((c) => `/work/${c.slug}`),
] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return routes.map((route) => ({
    url: `${baseUrl}${route === '/' ? '' : route}`,
    lastModified,
    changeFrequency: 'monthly',
    priority: route === '/' ? 1 : 0.6,
  }));
}
