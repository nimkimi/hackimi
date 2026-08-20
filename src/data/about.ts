type Experience = {
  title: string;
  company: string;
  location: string;
  period: string;
  details: string[];
};

type Education = {
  degree: string;
  institution: string;
  location?: string;
  period: string;
  details?: string[];
};

type ProfileLink = {
  platform: string;
  url: string;
};

type AboutData = {
  name: string;
  location: string;
  photo: string;
  summary: string;
  experience: Experience[];
  education: Education[];
  skills: {
    technical: string[];
    personal: string[];
  };
  interests: string[];
  languages: {
    name: string;
    proficiency: number;
  }[];
  profiles: ProfileLink[];
};

const about: AboutData = {
  name: 'Nima Hakimi',
  location: 'Oslo, Norway',
  photo: '/bigSmile.JPEG',
  summary:
    'I am a developer with experience from NAV IT and TV 2 Skole, focused on accessibility and user experience. I work mostly in TypeScript and React, with Kotlin and Python where a project calls for them, and I design what I build as well as engineering it.',

  experience: [
    {
      title: 'Frontend Developer',
      company: 'NAV IT',
      location: 'Oslo',
      period: 'Jul 2024 — Present',
      details: [
        'I work in Team Min side, a cross-functional platform team behind the microfrontends and notifications on nav.no.',
        'I maintain and develop the shared products Utbetalinger (Payments) and Dokumenter (Documents) for logged-in users.',
        'Technologies: Astro, TypeScript, Kotlin, Kafka',
      ],
    },
    {
      title: 'Summer Intern',
      company: 'NAV IT',
      location: 'Oslo',
      period: 'Jun 2023 — Aug 2023',
      details: [
        'I led the planning, design, and development of an internal registration app that replaced manual processes.',
        'It is now NAV’s primary platform for internal events.',
        'Technologies: Next.js, Kotlin/Ktor, PostgreSQL',
      ],
    },
    {
      title: 'Digital Accessibility Consultant',
      company: 'TV 2 Skole',
      location: 'Hybrid',
      period: 'Mar 2023 — Jun 2024 (part-time)',
      details: [
        'I advised Elevkanalen on accessibility, finding problems and fixing them to WCAG and EN 301 549.',
        'I took part in planning and ran user and accessibility testing for external clients, including DNB and Designit.',
        'I designed accessibility tests, ran them with users, and turned the findings into concrete recommendations.',
      ],
    },
    {
      title: 'Leader, Musikkom',
      company: 'NTNU — EMIL student association',
      location: 'Trondheim',
      period: 'Jan 2018 — Aug 2021',
      details: [
        'Musikkom is the music committee in EMIL, NTNU’s student association for Energy and Environment, for students who want to keep playing alongside their studies.',
        'Leading it taught me collaboration and communication, and what it means to take responsibility for a group.',
      ],
    },
  ],

  education: [
    {
      degree: 'Erasmus+ Exchange',
      institution: 'RWTH Aachen University',
      location: 'Aachen, Germany',
      period: 'Aug 2021 — Jun 2022',
    },
    {
      degree: 'Computer Science, 5-year Master’s Programme',
      institution: 'NTNU',
      location: 'Trondheim, Norway',
      period: 'Aug 2019 — Jun 2024',
      details: ['Specialisation: Software Systems'],
    },
    {
      degree: 'Energy and Environment, 5-year Master’s Programme',
      institution: 'NTNU',
      location: 'Trondheim, Norway',
      period: 'Aug 2018 — Jun 2019',
    },
    {
      degree: 'Upper Secondary School',
      institution: 'Lillestrøm videregående skole',
      location: 'Lillestrøm, Norway',
      period: 'Aug 2014 — Jun 2017',
    },
  ],

  skills: {
    technical: [
      'Astro',
      'React',
      'Next.js',
      'TypeScript',
      'JavaScript',
      'CSS/SCSS',
      'Tailwind CSS',
      'DevOps',
      'Starlight',
      'Kotlin',
      'Java',
      'Agile teamwork',
      'WCAG',
    ],
    personal: [
      'Analytical and structured',
      'Eager and willing to learn',
      'Programming and problem-solving',
      'Perseverance',
      'Humble and approachable',
    ],
  },

  interests: ['Music', 'Cosmology', 'Technology'],

  languages: [
    { name: 'Norwegian', proficiency: 5 },
    { name: 'English', proficiency: 5 },
    { name: 'Persian', proficiency: 5 },
    { name: 'German', proficiency: 2 },
  ],

  profiles: [
    {
      platform: 'GitHub',
      url: 'https://github.com/nimkimi',
    },
    {
      platform: 'LinkedIn',
      url: 'https://linkedin.com/in/nima-hakimi-387716175',
    },
  ],
};

export default about;
