'use client';
import Image from 'next/image';
import { motion } from 'framer-motion';

type Project = {
  title: string;
  description: string;
  href: string;
  image?: string;
  tags?: string[];
};

const projects: Project[] = [
  {
    title: 'Personal Portfolio',
    description: 'This site, built with Next.js, Tailwind, and server actions.',
    href: 'https://hackimi.dev',
    image: '/nima.JPG',
    tags: ['Next.js', 'Tailwind', 'TypeScript'],
  },
  {
    title: 'Project Two',
    description: 'A cool project. Replace with your real work.',
    href: '#',
    tags: ['React'],
  },
  {
    title: 'Project Three',
    description: 'Another highlight worth showcasing.',
    href: '#',
    tags: ['Node.js'],
  },
];

import AnimatedSection from '@/components/AnimatedSection';

export default function ProjectsPage() {
  return (
    <AnimatedSection>
      <section className="space-y-8 max-w-4xl mx-auto">
        <header className="space-y-2 text-center">
          <h1 className="text-3xl sm:text-4xl font-bold">Projects</h1>
          <p className="muted">A selection of things I’ve built and shipped.</p>
        </header>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((p, idx) => (
            <motion.a
              key={p.title}
              href={p.href}
              target="_blank"
              rel="noreferrer"
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-20% 0px' }}
              transition={{ delay: idx * 0.05, duration: 0.4 }}
              whileHover={{ y: -6 }}
              className="group relative overflow-hidden rounded-xl border border-light-accent/20 dark:border-dark-accent/20 bg-white/60 dark:bg-black/20 backdrop-blur shadow-sm"
            >
              {p.image ? (
                <div className="relative h-40 w-full">
                  <Image
                    src={p.image}
                    alt={p.title}
                    fill
                    className="object-cover opacity-90 group-hover:opacity-100 transition-opacity"
                  />
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              ) : null}
              <div className="p-4 space-y-2">
                <h3 className="font-semibold text-lg">{p.title}</h3>
                <p className="text-sm text-light-secondary dark:text-dark-secondary">
                  {p.description}
                </p>
                {p.tags && (
                  <div className="flex flex-wrap gap-2 pt-2">
                    {p.tags.map((t) => (
                      <span
                        key={t}
                        className="text-xs px-2 py-1 rounded-md border border-light-accent/30 dark:border-dark-accent/30 bg-white/40 dark:bg-white/5"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </motion.a>
          ))}
        </div>
      </section>
    </AnimatedSection>
  );
}
