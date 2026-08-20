/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      // The pre-2026-06-02 site served /projects (Google's current #1 result
      // for "Nima Hakimi developer"); the redesign renamed it to /work.
      { source: '/projects', destination: '/work', permanent: true },
      { source: '/projects/:path*', destination: '/work', permanent: true },
      // Case study removed 2026-08 after being deployed in the sitemap — keep
      // the indexed URL alive rather than 404 it (the /projects lesson).
      { source: '/work/be-my-guide', destination: '/work', permanent: true },
      // Exact-host only: preview deployments on *.vercel.app must stay untouched.
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'hackimi.vercel.app' }],
        destination: 'https://hackimi.dev/:path*',
        permanent: true,
      },
    ];
  },
  async rewrites() {
    return [
      // Unlisted talk deck (aug 2026): served from public/harness.html.
      // Intentionally not linked from any nav.
      { source: '/harness', destination: '/harness.html' },
    ];
  },
};

module.exports = nextConfig;
