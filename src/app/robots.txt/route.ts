const baseUrl = 'https://hackimi.dev';

export function GET() {
  return new Response(`User-agent: *\nAllow: /\nSitemap: ${baseUrl}/sitemap.xml\n`, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=86400',
    },
  });
}
