export type CaseSection = {
  heading: 'Context' | 'My role' | 'Problem' | 'Approach' | 'Result';
  body: string;
};
export type CaseLink = { label: string; href: string };
export type CaseStudy = {
  slug: string;
  title: string;
  summary: string; // one-line outcome/impact
  year: string; // e.g. '2025'
  role: string; // e.g. 'Solo full-stack' / 'Lead developer'
  tech: string[];
  links?: CaseLink[];
  inProgress?: boolean;
  sections: CaseSection[]; // exactly the 5 headings, in order
};

const ORDER = ['Context', 'My role', 'Problem', 'Approach', 'Result'] as const;

const work: CaseStudy[] = [
  {
    slug: 'be-my-guide',
    title: 'Be My Guide',
    summary:
      'A request-broadcast platform that pairs visually impaired Norwegians with nearby sighted volunteer guides for running, hiking, and cross-country skiing.',
    year: '2026',
    role: 'Solo full-stack — design and engineering',
    tech: [
      'Next.js 16',
      'React 19',
      'TypeScript (strict)',
      'Tailwind CSS v4',
      'Neon Postgres',
      'Prisma',
      'Auth.js v5',
      'Web Push',
      'Upstash Redis',
      'Vercel BotID',
      'Resend',
      'Vitest',
    ],
    inProgress: true,
    links: [{ label: 'GitHub', href: 'https://github.com/nimkimi/be-my-guide' }],
    sections: [
      {
        heading: 'Context',
        body: 'Visually impaired Norwegians can run, ski, and hike — but only alongside a sighted guide, and finding one is informal and ad-hoc: word of mouth, Facebook groups, and club rosters that have not been updated in years. Plenty of sighted people would happily guide a couple of times a month, but there is no low-commitment way to plug in. Be My Guide is a request-broadcast matching app that closes that coordination gap for two real Oslo archetypes: a participant who just wants company for a 5K, and a volunteer who wants to help without joining a formal club.',
      },
      {
        heading: 'My role',
        body: 'I am designing and building this solo, end to end — product scope, the accessibility-first UX, the data model, auth, and the real-time notification layer. It is currently in active development, with the data model, magic-link and Google auth, the request and matching flows, and admin guide-review under construction toward an MVP whose success bar is five approved guides and one real arrangement.',
      },
      {
        heading: 'Problem',
        body: 'The hardest design problem is trust and accessibility under low coordination friction: the experience has to meet WCAG 2.2 AA in both light and dark modes, work screen-reader-first for participants, and still feel calm rather than like a SaaS dashboard. The hardest engineering problem is fan-out — when a participant posts a request, every approved guide in that region with a matching activity type needs a push notification within seconds, without spamming anyone and without leaking personal contact details before both sides have agreed.',
      },
      {
        heading: 'Approach',
        body: 'On the design side I gave the two roles distinct entry points from the landing page, kept request creation to a single mobile-first form with native pickers for screen-reader friendliness, and deferred contact reveal until an arrangement is confirmed so phone and email stay private until they are needed. On the engineering side I modelled Users, Requests, Interests, and Arrangements in Postgres with the indexes the matching fan-out actually queries (region + verificationStatus for guide lookup), built notifications on the raw Web Push API with a hand-rolled service worker to avoid PWA bloat, gated every new guide behind manual admin review, and hardened the public endpoints with Upstash Redis rate limiting and Vercel BotID. Tokens and sessions run through Auth.js v5 with a database session strategy so sessions are revocable.',
      },
      {
        heading: 'Result',
        body: 'The build is in progress, but the architecture is already proving the duality I care about: an accessibility-first, deliberately calm interface sitting on top of a real-time, abuse-resistant matching backend. It is a genuinely hard product — broadcast matching, push fan-out, contact-privacy, and strict a11y all at once — and it is the clearest current example of how I work as a developer who designs.',
      },
    ],
  },
  {
    slug: 'concert-radar',
    title: 'Concert Radar',
    summary:
      'A Spotify-connected concert discovery app that aggregates four ticketing sources and emails you when an artist you follow plays within your radius. MVP shipped — 123 tests passing.',
    year: '2026',
    role: 'Solo full-stack — design and engineering',
    tech: [
      'Next.js 15',
      'TypeScript (strict)',
      'Tailwind CSS',
      'Prisma',
      'SQLite',
      'NextAuth v5',
      'Spotify OAuth',
      'Vercel Cron',
      'Resend',
      'Vitest',
    ],
    links: [{ label: 'GitHub', href: 'https://github.com/nimkimi/concert-radar' }],
    sections: [
      {
        heading: 'Context',
        body: 'Music fans miss concerts by artists they follow because announcements are scattered across Instagram, venue sites, and a handful of separate ticketing platforms. There is no single place to say "tell me when any of my Spotify artists plays within 100km of Bergen." Concert Radar aggregates Ticketmaster, Bandsintown, Songkick, and Billetto — the latter being the dominant Nordic platform — to cover the smaller venues and touring acts that announce on some sources but not others.',
      },
      {
        heading: 'My role',
        body: 'I designed and built the whole MVP solo: the Spotify-native visual direction, the dashboard and concert flows, the data model, the multi-source aggregation backend, and the daily notification pipeline. I shipped all 15 planned vertical-slice tasks, then followed up with a v2 redesign and a dedicated mobile port with a bottom tab bar.',
      },
      {
        heading: 'Problem',
        body: 'Aggregating four independent APIs creates real engineering problems: the same show appears on multiple sources, free-text artist search produces false positives like "The 1975" matching "1975 Anniversary Concert," and a user with 200 tracked artists hitting four APIs could fire 800 calls at once. On the design side the dashboard had to feel like a native companion to Spotify — rich artist imagery, not a bare table — while staying fast and never emailing the same user about the same concert twice.',
      },
      {
        heading: 'Approach',
        body: 'I abstracted every source behind a shared SourceAdapter interface so adapters are independently unit-tested against recorded JSON fixtures, with no live network in CI, and put Songkick and Billetto behind feature flags. Cross-source duplicates collapse to one card with multiple source badges by grouping on (normalized artist, venue city, event date), using diacritic-stripping name normalization and Spotify popularity as a matching confidence signal. A daily Vercel Cron job syncs all users, writes per-source SyncLog rows so one failing source never aborts the run, and sends a Resend digest — with a unique (userId, concertId) constraint guaranteeing no concert is ever emailed twice. Spotify OAuth tokens are AES-256-GCM encrypted at rest behind a custom NextAuth adapter, distances use an inline Haversine, and concert times render in the venue local time zone.',
      },
      {
        heading: 'Result',
        body: 'The MVP shipped with 29 of 30 definition-of-done items complete and 123 tests passing across 17 files on a clean production build and 14 routes. It then earned a full v2 redesign — a marketing landing page, a hero-card dashboard, light and dark themes — plus a mobile port. It is my strongest proof of disciplined, test-first engineering paired with a coherent design system.',
      },
    ],
  },
  {
    slug: 'nav-event-registration',
    title: 'NAV Internal Event Registration',
    summary:
      'Led design and development of an internal event-registration app that replaced NAV’s manual processes and became the organisation’s primary tool for internal events.',
    year: '2023',
    role: 'Lead designer & developer (summer internship)',
    tech: ['Next.js', 'TypeScript', 'Kotlin', 'Ktor', 'PostgreSQL'],
    sections: [
      {
        heading: 'Context',
        body: 'During my 2023 summer internship at NAV IT — Norway’s Labour and Welfare Administration, one of the country’s largest public-sector tech organisations — internal events were still being organised through manual, spreadsheet-and-email processes that did not scale across teams. The internship brief was to design and build a better way to register for and manage internal events.',
      },
      {
        heading: 'My role',
        body: 'I led the planning, design, and development of the application as the internship’s driving contributor — owning the user flows and information design as well as the implementation across the stack. It was a genuinely full-stack role: a React/Next.js frontend talking to a Kotlin/Ktor backend over a PostgreSQL database.',
      },
      {
        heading: 'Problem',
        body: 'A registration tool for a large organisation has to be obvious enough that any employee can sign up for an event in seconds, while giving organisers the structure they need to manage capacity and attendance. The design challenge was reducing a sprawling manual workflow into a few clear screens; the engineering challenge was a clean data model for events, registrations, and capacity behind a typed Kotlin API.',
      },
      {
        heading: 'Approach',
        body: 'I designed the flows around the two distinct jobs — registering as an attendee and administering an event — and kept each path short and self-explanatory. On the backend I built a Ktor service in Kotlin over PostgreSQL with a schema centred on events, registrations, and capacity rules, and a Next.js frontend in TypeScript that consumed it. Working inside NAV’s platform meant building to public-sector expectations for reliability and accessibility from the start.',
      },
      {
        heading: 'Result',
        body: 'The solution replaced the manual process and became NAV’s primary platform for registering and managing internal events — adoption well beyond a typical internship deliverable. It is the project that turned a summer internship into a full-time frontend role at NAV IT, where I now work on platform services for nav.no. (Internal tool — no public link.)',
      },
    ],
  },
];

// Dev-time guard so headings never drift from the template contract.
work.forEach((c) => {
  if (c.sections.map((s) => s.heading).join('|') !== ORDER.join('|')) {
    throw new Error(`Case "${c.slug}" sections must be: ${ORDER.join(', ')}`);
  }
});

export default work;
