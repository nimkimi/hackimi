'use client';
import AnimatedSection from '@/components/AnimatedSection';
import { motion } from 'framer-motion';
import about from '@/data/about';
import Image from 'next/image';
import Link from 'next/link';
import { IconBrandGithub, IconBrandLinkedin } from '@tabler/icons-react';

export default function AboutPage() {
  return (
    <AnimatedSection>
      <article className="space-y-10 max-w-4xl mx-auto">
        <header className="space-y-2 text-center">
          <h1 className="text-3xl sm:text-4xl font-bold">About</h1>
          <p className="muted max-w-2xl mx-auto">A concise overview of my background, experience, and skills.</p>
        </header>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Profile</h2>
          <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
            <div className="w-32 h-32 relative rounded-full overflow-hidden flex-shrink-0">
              <Image
                src={about.photo}
                alt={about.name}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 33vw"
                priority
              />
            </div>
            <div className="space-y-3">
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                <h3 className="text-lg font-medium">{about.name}</h3>
                <p className="text-sm text-light-secondary dark:text-dark-secondary">{about.location}</p>
              </motion.div>
              <motion.p
                initial={{ opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="leading-relaxed max-w-3xl"
              >
                {about.summary}
              </motion.p>
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="flex flex-wrap gap-3 pt-2"
              >
                {about.profiles.map((profile) => (
                  <a
                    key={profile.platform}
                    href={profile.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm px-3 py-1 rounded-md border border-light-accent/30 dark:border-dark-accent/30 hover:bg-light-accent/10 dark:hover:bg-dark-accent/10 transition-colors"
                  >
                    {profile.platform === 'GitHub' ? (
                      <IconBrandGithub size={18} className="shrink-0" aria-hidden="true" />
                    ) : (
                      <IconBrandLinkedin size={18} className="shrink-0" aria-hidden="true" />
                    )}
                    <span className="leading-none">{profile.platform}</span>
                  </a>
                ))}
              </motion.div>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Experiences</h2>
          <ul className="relative space-y-6 before:absolute before:left-4 before:top-0 before:h-full before:w-px before:bg-light-accent/30 dark:before:bg-dark-accent/30">
            {about.experience.map((exp, i) => (
              <motion.li
                key={`${exp.company}-${exp.title}`}
                initial={{ opacity: 0, x: -12 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05, duration: 0.45 }}
                className="relative ml-10 rounded-lg border border-light-accent/20 dark:border-dark-accent/20 p-4"
              >
                <span className="absolute -left-6 top-4 h-3 w-3 rounded-full bg-light-accent dark:bg-dark-accent shadow" />
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <h3 className="font-medium">
                    {exp.title}
                    {exp.company ? ` — ${exp.company}` : ''}
                  </h3>
                  <span className="text-sm text-light-secondary dark:text-dark-secondary">{exp.period}</span>
                </div>
                {exp.location && (
                  <p className="text-sm text-light-secondary dark:text-dark-secondary mt-1">{exp.location}</p>
                )}
                <ul className="mt-2 space-y-1">
                  {exp.details.map((detail, j) => (
                    <li key={j} className="text-sm ml-4 list-disc text-light-secondary dark:text-dark-secondary">
                      {detail}
                    </li>
                  ))}
                </ul>
              </motion.li>
            ))}
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Education</h2>
          <ul className="space-y-3">
            {about.education.map((edu, i) => (
              <motion.li
                key={`${edu.institution}-${edu.degree}`}
                initial={{ opacity: 0, x: -12 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05, duration: 0.45 }}
                className="rounded-lg border border-light-accent/20 dark:border-dark-accent/20 p-4"
              >
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <h3 className="font-medium">
                    {edu.degree} — {edu.institution}
                  </h3>
                  <span className="text-sm text-light-secondary dark:text-dark-secondary">{edu.period}</span>
                </div>
                {edu.location && (
                  <p className="text-sm text-light-secondary dark:text-dark-secondary mt-1">{edu.location}</p>
                )}
                {edu.details && edu.details.length > 0 && (
                  <ul className="mt-2 space-y-1">
                    {edu.details.map((detail, j) => (
                      <li key={j} className="text-sm ml-4 list-disc text-light-secondary dark:text-dark-secondary">
                        {detail}
                      </li>
                    ))}
                  </ul>
                )}
              </motion.li>
            ))}
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Skills</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-md font-medium mb-3">Technical</h3>
              <div className="flex flex-wrap gap-2">
                {about.skills.technical.map((skill) => (
                  <span
                    key={skill}
                    className="text-sm px-3 py-1 rounded-md border border-light-accent/30 dark:border-dark-accent/30"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-md font-medium mb-3">Personal</h3>
              <div className="flex flex-wrap gap-2">
                {about.skills.personal.map((skill) => (
                  <span
                    key={skill}
                    className="text-sm px-3 py-1 rounded-md border border-light-accent/30 dark:border-dark-accent/30"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Languages</h2>
          <div className="flex flex-wrap gap-4">
            {about.languages.map((language) => (
              <div key={language.name} className="flex flex-col items-center">
                <span className="font-medium">{language.name}</span>
                <div className="flex mt-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <span
                      key={i}
                      className={`w-2 h-2 mx-0.5 rounded-full ${
                        i < language.proficiency
                          ? 'bg-light-accent dark:bg-dark-accent'
                          : 'bg-light-accent/20 dark:bg-dark-accent/20'
                      }`}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Interests</h2>
          <div className="flex flex-wrap gap-2">
            {about.interests.map((interest) => (
              <span
                key={interest}
                className="text-sm px-3 py-1 rounded-md border border-light-accent/30 dark:border-dark-accent/30"
              >
                {interest}
              </span>
            ))}
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Contact</h2>
          <p>
            Do you want to know more about my work or have questions? Feel free to contact me via{' '}
            <Link href="/contact" className="text-light-accent dark:text-dark-accent hover:underline">
              the contact page
            </Link>
            .
          </p>
        </section>
      </article>
    </AnimatedSection>
  );
}
