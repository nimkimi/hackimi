export type CaseSection = {
  heading: 'Context' | 'My role' | 'Problem' | 'Approach' | 'Result';
  body: string;
};
export type CaseLink = { label: string; href: string };
export type CaseImage = { src: string; alt: string; caption?: string };
export type CaseStudy = {
  slug: string;
  title: string;
  summary: string; // one-line outcome/impact
  year: string; // e.g. '2025'
  role: string; // e.g. 'Solo full-stack' / 'Lead developer'
  tech: string[];
  links?: CaseLink[];
  inProgress?: boolean;
  // Real screenshots; first image is the cover.
  // Optional — cases without a built UI (e.g. internal tools) omit this.
  images?: CaseImage[];
  sections: CaseSection[]; // exactly the 5 headings, in order
};

const ORDER = ['Context', 'My role', 'Problem', 'Approach', 'Result'] as const;

const work: CaseStudy[] = [
  {
    slug: 'sonari',
    title: 'Sonari',
    summary:
      'A text-to-speech layer that makes Claude Code usable with the screen off. Built for blind and low-vision developers: every session is read aloud in order, and a distinct sound tells you the moment a decision needs you.',
    year: '2026',
    role: 'Solo: design and engineering',
    tech: ['Python', 'Swift', 'Claude Code hooks', 'launchd', 'Kokoro TTS', 'pytest'],
    links: [{ label: 'GitHub', href: 'https://github.com/nimkimi/sonari' }],
    sections: [
      {
        heading: 'Context',
        body: 'Coding agents run in terminals that redraw constantly, and screen readers handle that badly. A blind developer can use the model but not the tool around it. Sonari is a macOS speech layer for Claude Code that reads each session aloud, in order. The goal is a full working session with the screen off.',
      },
      {
        heading: 'My role',
        body: 'I built it end to end: the daemon architecture, the sound vocabulary, the hotkey system, and the product decisions about what is worth saying out loud. Sound is the whole interface, so the design work here was picking earcons, verbosity levels, and wording that stays truthful about what the agent is doing.',
      },
      {
        heading: 'Problem',
        body: 'The hard part is trust in what you hear. Speech has to arrive in the order things happened, across several concurrent sessions, and it can never stall: a silent failure and a finished task sound identical. That makes liveness the core engineering problem. The interface also has to stay controllable mid-speech, because listening is slow and you constantly want to skip, repeat, or jump.',
      },
      {
        heading: 'Approach',
        body: 'A launchd-managed daemon owns the speech pipeline, and every Claude Code session feeds it through hooks; each session’s output is queued and spoken in the order it happened. Decisions get earcons, one sound per type, so a question registers before the words do. Answers go by option number. A small Swift helper intercepts the global hotkeys (stop, repeat, jump between sessions, jump to the open decision) at the OS level, so they work while speech is playing. The core runs on the stock macOS Python with no third-party packages, so an install cannot be broken by whatever Python arrives next; a neural voice is an optional add-on.',
      },
      {
        heading: 'Result',
        body: 'Sonari is public and installs from a Claude Code marketplace, and I run my own sessions through it. Most of the engineering went into the failures you would never see: the hotkey helper sounds an alarm if the speech daemon dies, and an update that fails to speak is kept unheard rather than dropped, so you catch up on it instead of missing it.',
      },
    ],
  },
  {
    slug: 'syncward',
    title: 'syncward',
    summary:
      'Carries your whole Claude Code setup between machines as config-as-code in a git repo you own, guarded by a secret scanner that blocks the push instead of warning you.',
    year: '2026',
    role: 'Solo: design and engineering',
    tech: ['TypeScript', 'Bun', 'Git', 'Shell', 'bun:test'],
    inProgress: true,
    sections: [
      {
        heading: 'Context',
        body: 'An AI coding setup accumulates real value: settings, memory, skills, hooks, keybindings, an installed-plugin list. Carrying ~/.claude between machines by hand is tedious, and the folder sits next to API keys and tokens, so naive syncing is exactly how credentials end up in a git repo. syncward syncs the whole setup as config-as-code in a repository you own, with a scanner standing between your files and every push.',
      },
      {
        heading: 'My role',
        body: 'I designed the safety model first and let it constrain everything else: the scanner, the backup and restore path, the locking, and the shape of the CLI all follow from one rule, that a bad push has to be stopped by the tool rather than by me remembering to check.',
      },
      {
        heading: 'Problem',
        body: 'One push with a token in it cannot be taken back: the token sits in the git history and the only fix left is rotating it. Divergence is the quieter risk: two machines drift, and a careless apply flattens one of them. A plugin manifest also executes, because a Claude Code plugin runs code at launch. Each of those needed a default that fails safe.',
      },
      {
        heading: 'Approach',
        body: 'Every push runs through a fail-closed secret scanner that reads exactly the bytes being committed. Anything that looks like a credential blocks the push; you opt out per finding with a reviewed fingerprint allowlist. An apply backs up first, takes a lock, refuses to silently clobber a machine that has diverged, and can be rolled back. syncward holds new plugins back until you approve them, and the installer is built to verify a published checksum before it touches your PATH. TypeScript on Bun, backed by about 1,500 tests.',
      },
      {
        heading: 'Result',
        body: 'The build is complete: scanner, sync, backup and restore, doctor, and init. What remains before it goes public is release engineering, so the repo is private for now.',
      },
    ],
  },
  {
    slug: 'dovetail',
    title: 'dovetail',
    summary:
      'Catches the quality shortcuts an AI coding agent takes, in the seconds before the code lands. Two advisory hooks for Claude Code that can only advise: no blocking, no auto-edits, no network.',
    year: '2026',
    role: 'Solo: design and engineering',
    tech: ['Python (stdlib only)', 'Claude Code hooks', 'pytest', 'JSONL telemetry'],
    links: [{ label: 'GitHub', href: 'https://github.com/nimkimi/dovetail' }],
    sections: [
      {
        heading: 'Context',
        body: 'Written rules decay: instructions loaded at session start get buried as the context grows, and review tools only speak after the code exists. In my own sessions the agent would settle on the first solution that worked, not the best-integrated one. dovetail is a Claude Code plugin that raises the right concern at the moment code is written: that a guard is about to be shortened, that something two files over already does this, that a new dependency needs vetting.',
      },
      {
        heading: 'My role',
        body: 'One call shaped everything: the hooks advise and do nothing else, so the worst case is an ignorable line of text rather than a broken session. I am also the entire user base. dovetail runs in every one of my Claude Code sessions, so a bad decision turns into noise in my own workflow the same day, and the tuning loop runs on that: build a change, live with it, adjust against the telemetry.',
      },
      {
        heading: 'Problem',
        body: 'The first failure mode is banner blindness: a block repeated on every edit becomes wallpaper, and on day one dovetail spoke on 71 percent of the edits it evaluated. The opposite failure is silence, the default for a hook that is only allowed to advise: one hook had been dead in production for weeks, because real session transcripts had a different shape than every test fixture assumed. Neither failure is visible without measurement.',
      },
      {
        heading: 'Approach',
        body: 'dovetail is two Python hooks, standard library only, and they exit 0 on every path, so a crash in a hook can never take a session down with it. The author-time cue is proportional: silent on cosmetic and out-of-lane changes, a full teaching block once per fresh context, a one-line stand-in on repeats. The finish check fires only when the agent’s reply changed source files, and it names them. Every firing writes a metadata-only telemetry record, and a weekly job reads the log and flags drift on its own.',
      },
      {
        heading: 'Result',
        body: 'The first month of telemetry, 8,953 firings, showed that one cue in ten was a reuse nudge on a file that already existed, right where it helped least; that cue now fires only on new files. The dead-hook incident became regression tests derived from real transcripts, and the suite is 115 tests now. The cues also reach the sub-sessions I hand implementation work to, which is where most of the code in a big change gets written; I verified that path live. The code is public and installs as a Claude Code plugin, though it stays tooling for my own setup first.',
      },
    ],
  },
  {
    slug: 'concert-radar',
    title: 'Concert Radar',
    summary:
      'Connects to your Spotify and watches four ticketing platforms, then emails you when an artist you actually listen to announces a show near you.',
    year: '2026',
    role: 'Solo full-stack: design and engineering',
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
    images: [
      {
        src: '/work/concert-radar/landing.jpg',
        alt: "Concert Radar landing — 'Never miss a show from an artist you actually listen to.'",
        caption: 'Landing',
      },
      {
        src: '/work/concert-radar/sigrid.jpg',
        alt: 'Sigrid — a real artist the app surfaces, USF Verftet, Bergen',
        caption: 'Sigrid · USF Verftet, Bergen',
      },
      {
        src: '/work/concert-radar/aurora.jpg',
        alt: 'Aurora — a real artist the app surfaces, Bergenhus Festning',
        caption: 'Aurora · Bergenhus Festning',
      },
    ],
    sections: [
      {
        heading: 'Context',
        body: 'Concert announcements are scattered across Instagram, venue pages, and ticketing platforms that each only know their own listings, so following an artist means following four services and still missing the show announced somewhere else. Concert Radar watches Ticketmaster, Bandsintown, Songkick, and Billetto, which carries many of the smaller Nordic venues, and lets you say “tell me when any of my Spotify artists plays within 100 km of Bergen.”',
      },
      {
        heading: 'My role',
        body: 'I designed and built the whole thing: the Spotify-native visual direction, the dashboard and concert flows, the data model, the multi-source aggregation backend, and the daily notification pipeline. I shipped the MVP one working feature at a time, then followed up with a v2 redesign and a dedicated mobile port with a bottom tab bar.',
      },
      {
        heading: 'Problem',
        body: 'Four independent APIs disagree with each other. The same show appears on several of them, free-text artist search matches “The 1975” to a “1975 Anniversary Concert,” and a user tracking 200 artists across four APIs could fire 800 calls at once. The dashboard had to feel like a native companion to Spotify, big artist imagery instead of a bare table, and stay fast. And it could never email the same person about the same concert twice.',
      },
      {
        heading: 'Approach',
        body: 'Each source sits behind a shared SourceAdapter interface, unit-tested against recorded JSON fixtures. CI never touches the network. Songkick and Billetto ship behind feature flags, so a misbehaving source can be switched off without a deploy. Cross-source duplicates collapse into one card with a badge per source, grouped on normalized artist, venue city, and event date, with diacritic-stripped names and Spotify popularity as a confidence signal. A daily Vercel cron job syncs every user instead of fanning out on demand, writes a SyncLog row per source so one failure never aborts the run, and sends a Resend digest; a unique (userId, concertId) constraint makes double-emailing impossible. Spotify OAuth tokens are AES-256-GCM encrypted at rest behind a custom NextAuth adapter, distances use an inline Haversine, and concert times render in the venue’s local time zone.',
      },
      {
        heading: 'Result',
        body: 'The MVP shipped with 29 of its 30 planned scope items: 14 routes on a clean production build, 123 tests across 17 files. It then got a marketing landing page, a hero-card dashboard, light and dark themes, and the mobile port.',
      },
    ],
  },
  {
    slug: 'nav-event-registration',
    title: 'NAV Internal Event Registration',
    summary:
      'The tool NAV uses to register and run internal events. I led the build as a summer intern, and it turned into a full-time job.',
    year: '2023',
    role: 'Lead designer & developer (summer internship)',
    tech: ['Next.js', 'TypeScript', 'Kotlin', 'Ktor', 'PostgreSQL'],
    sections: [
      {
        heading: 'Context',
        body: 'NAV IT, the tech arm of Norway’s Labour and Welfare Administration, was organising internal events over spreadsheets and email in 2023, and that did not scale across one of the country’s largest public-sector tech organisations. My internship brief was to build a better way to register for and manage internal events.',
      },
      {
        heading: 'My role',
        body: 'It was a full-stack role: I led the planning, design, and development, owning the user flows and information design as well as the implementation on both sides of the API.',
      },
      {
        heading: 'Problem',
        body: 'Any employee had to be able to sign up for an event in seconds, without instructions, while organisers needed enough structure to manage capacity and attendance. The design job was compressing a sprawling manual workflow into a few obvious screens; the engineering job, a data model for events, registrations, and capacity behind a typed Kotlin API.',
      },
      {
        heading: 'Approach',
        body: 'I split the flows by job, registering as an attendee and administering an event, and kept each path short enough to need no explanation. The backend is a Kotlin/Ktor service over PostgreSQL; the frontend is React with Next.js in TypeScript. Working inside NAV’s platform meant meeting public-sector reliability and accessibility requirements from the start.',
      },
      {
        heading: 'Result',
        body: 'It became NAV’s primary platform for internal events, more adoption than a summer project usually gets, and it turned the internship into a full-time frontend role at NAV IT, where I now work on platform services for nav.no. It is an internal tool, so there is no public link.',
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
