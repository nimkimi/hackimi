'use client';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { IconArrowRight, IconBrandGithub, IconMail } from '@tabler/icons-react';

export default function Home() {
  return (
    <section className="flex min-h-[75vh] flex-col items-center justify-center text-center gap-8 max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
        className="relative"
      >
        <div className="absolute -inset-12 rounded-full bg-gradient-to-tr from-light-accent/35 to-transparent dark:from-dark-accent/25 blur-3xl" />
        <motion.div
          initial={{ scale: 0.9, rotate: -2 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="relative h-28 w-28 sm:h-36 sm:w-36 mx-auto mb-5 rounded-full overflow-hidden ring-2 ring-light-accent/40 dark:ring-dark-accent/40 shadow-xl"
        >
          <Image src="/nima.JPG" alt="Nima Hakimi" fill className="object-cover" priority />
        </motion.div>
        <h1 className="relative text-4xl sm:text-6xl font-extrabold tracking-tight">
          <span className="bg-clip-text text-transparent bg-[linear-gradient(110deg,theme(colors.light.primary)_0%,theme(colors.light.primary)_40%,theme(colors.light.accent)_60%,theme(colors.light.primary)_80%)] dark:bg-[linear-gradient(110deg,theme(colors.dark.primary)_0%,theme(colors.dark.primary)_40%,theme(colors.dark.accent)_60%,theme(colors.dark.primary)_80%)] bg-[length:200%_100%] animate-[shimmer_4s_ease_infinite]">
            Hi, I’m Nima Hakimi
          </span>
        </h1>
      </motion.div>

      <motion.p
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.6 }}
        className="text-lg sm:text-xl text-light-secondary dark:text-dark-secondary max-w-2xl"
      >
        I craft elegant, fast, and accessible web apps. Dive into my projects or learn more about me.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35, duration: 0.6 }}
        className="flex flex-wrap items-center justify-center gap-3 sm:gap-4"
      >
        <Link href="/projects" className="btn btn-outline">
          <span className="flex items-center gap-2 leading-none">
            View Projects <IconArrowRight size={18} className="shrink-0" aria-hidden="true" />
          </span>
        </Link>
        <Link href="/about" className="btn btn-accent">
          About Me
        </Link>
        <a href="mailto:nima@hackimi.dev" className="btn btn-outline px-4 py-2">
          <span className="flex items-center gap-2 leading-none">
            <IconMail size={18} className="shrink-0" aria-hidden="true" /> Contact
          </span>
        </a>
        <a href="https://github.com/nima-hakimi" target="_blank" rel="noreferrer" className="btn btn-outline px-4 py-2">
          <span className="flex items-center gap-2 leading-none">
            <IconBrandGithub size={18} className="shrink-0" aria-hidden="true" /> GitHub
          </span>
        </a>
      </motion.div>
    </section>
  );
}
