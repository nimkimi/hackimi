import type { MetadataRoute } from 'next';

const baseUrl = 'https://hackimi.dev';

const routes = ['/', '/about', '/projects', '/contact'] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return routes.map((route) => ({
    url: `${baseUrl}${route === '/' ? '' : route}`,
    lastModified,
    changeFrequency: 'monthly',
    priority: route === '/' ? 1 : 0.6,
  }));
}
