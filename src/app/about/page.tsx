'use client';
import AnimatedSection from '@/components/AnimatedSection';
import { motion } from 'framer-motion';

export default function AboutPage() {
  return (
    <AnimatedSection>
      <article className="space-y-10 max-w-4xl mx-auto">
        <header className="space-y-2 text-center">
          <h1 className="text-3xl sm:text-4xl font-bold">About</h1>
          <p className="muted max-w-2xl mx-auto">
            A concise overview of my background, experience, and skills.
          </p>
        </header>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Profile</h2>
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="leading-relaxed max-w-3xl"
          >
            I’m a software engineer focused on building thoughtful, performant,
            and user-friendly products. I enjoy bringing ideas to life with
            modern web technologies and clean UX.
          </motion.p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Experience</h2>
          <ul className="relative space-y-6 before:absolute before:left-4 before:top-0 before:h-full before:w-px before:bg-light-accent/30 dark:before:bg-dark-accent/30">
            {[
              {
                role: 'Senior Software Engineer — Company',
                range: '2023 — Present',
                desc: 'Lead front-end initiatives, architected design systems, and shipped user-facing features.',
              },
              {
                role: 'Software Engineer — Company',
                range: '2020 — 2023',
                desc: 'Built full-stack features with Next.js and Node, improving performance and UX.',
              },
            ].map((item, i) => (
              <motion.li
                key={item.role}
                initial={{ opacity: 0, x: -12 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05, duration: 0.45 }}
                className="relative ml-10 rounded-lg border border-light-accent/20 dark:border-dark-accent/20 p-4"
              >
                <span className="absolute -left-6 top-4 h-3 w-3 rounded-full bg-light-accent dark:bg-dark-accent shadow" />
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <h3 className="font-medium">{item.role}</h3>
                  <span className="text-sm text-light-secondary dark:text-dark-secondary">
                    {item.range}
                  </span>
                </div>
                <p className="text-sm mt-1 text-light-secondary dark:text-dark-secondary">
                  {item.desc}
                </p>
              </motion.li>
            ))}
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Education</h2>
          <ul className="space-y-3">
            <motion.li
              initial={{ opacity: 0, x: -12 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45 }}
              className="rounded-lg border border-light-accent/20 dark:border-dark-accent/20 p-4"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-medium">
                  B.Sc. in Computer Science — University
                </h3>
                <span className="text-sm text-light-secondary dark:text-dark-secondary">
                  2016 — 2020
                </span>
              </div>
              <p className="text-sm mt-1 text-light-secondary dark:text-dark-secondary">
                Coursework in algorithms, systems, and human-computer
                interaction.
              </p>
            </motion.li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Skills</h2>
          <div className="flex flex-wrap gap-2">
            {[
              'TypeScript',
              'React',
              'Next.js',
              'Node.js',
              'CSS',
              'Tailwind',
              'Testing',
            ].map((skill) => (
              <span
                key={skill}
                className="text-sm px-3 py-1 rounded-md border border-light-accent/30 dark:border-dark-accent/30"
              >
                {skill}
              </span>
            ))}
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Contact</h2>
          <p>
            Want a full CV or references? Reach out via the contact page and
            I’ll gladly share more.
          </p>
        </section>
      </article>
    </AnimatedSection>
  );
}
