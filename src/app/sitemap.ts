import type { MetadataRoute } from 'next';
import work from '@/data/work';
import { SITE_URL } from '@/lib/site';

const routes = ['/', '/about', '/work', '/contact', ...work.map((c) => `/work/${c.slug}`)] as const;

/**
 * URL list only, deliberately: the previous lastModified stamped `new Date()`
 * on every build (a false freshness signal on all URLs), and Google ignores
 * changeFrequency/priority. No signal beats a wrong signal.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  return routes.map((route) => ({ url: `${SITE_URL}${route === '/' ? '' : route}` }));
}
