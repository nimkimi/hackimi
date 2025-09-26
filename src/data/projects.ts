type Project = {
  title: string;
  description: string;
  href: string;
  imageSrc: string;
  tags: string[];
};

const projects: Project[] = [
  {
    title: 'Personal Portfolio',
    description: 'This site, built with Next.js, Tailwind, and server actions.',
    href: 'https://hackimi.dev',
    imageSrc: '/nima.JPG',
    tags: ['Next.js', 'Tailwind', 'TypeScript'],
  },
];

export default projects;
