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
    'I am a developer with experience from NAV IT and TV 2 Skole, with a focus on accessibility and user experience. I work with modern technologies such as React, TypeScript and Kotlin to develop responsive and user-friendly applications. My background in software development and design provides a solid foundation for delivering holistic solutions with the user in focus.',

  experience: [
    {
      title: 'Frontend Developer',
      company: 'NAV IT',
      location: 'Oslo',
      period: 'Jul 2024 — Present',
      details: [
        'Frontend developer in Team Min side – a cross-functional platform team delivering platform services for microfrontends and notifications on nav.no.',
        'Contribute to the maintenance and further development of the shared products Utbetalinger (Payments) and Dokumenter (Documents) for logged-in users.',
        'Technologies: Astro.js, TypeScript, Kotlin, Kafka',
      ],
    },
    {
      title: 'Summer Intern',
      company: 'NAV IT',
      location: 'Oslo',
      period: 'Jun 2023 — Aug 2023',
      details: [
        'Led planning, design, and development of an internal registration app that replaced manual processes.',
        'The solution is now NAV’s primary platform for event registration and management of internal events.',
        'Technologies: Next.js, Kotlin/Ktor, PostgreSQL',
      ],
    },
    {
      title: 'Digital Accessibility Consultant',
      company: 'TV 2 Skole',
      location: 'Hybrid',
      period: 'Mar 2023 — Jun 2024 (part-time)',
      details: [
        'Advisor for Elevkanalen, identified and implemented measures in line with WCAG/EN301549.',
        'Participated in planning and carried out user and accessibility testing for external clients, including DNB and Designit.',
        'This experience strengthened my competence in test design, analysis, and concrete recommendations.',
      ],
    },
    {
      title: 'Leader, Musikkom',
      company: 'NTNU – EMIL student association',
      location: 'Trondheim',
      period: 'Jan 2018 — Aug 2021',
      details: [
        'Musikkom is a committee in the EMIL student association for Energy and Environment. Its purpose is to provide students interested in music with opportunities to further develop their interest alongside their studies.',
        'As leader, I learned the importance of collaboration and communication, and what it means to take responsibility.',
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
      details: ['Specialization: Software Systems'],
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
      'Astro.js',
      'React.js',
      'Next.js',
      'TypeScript',
      'JavaScript (ES5/ES6)',
      'CSS/SCSS',
      'Tailwind CSS',
      'DevOps',
      'Starlight (Documentation framework)',
      'Kotlin',
      'Java',
      'Agile development in cross-functional teams',
      'Web Content Accessibility Guidelines (WCAG)',
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
