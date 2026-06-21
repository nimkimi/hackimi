import about from '@/data/about';
import { buildPageMetadata } from '@/lib/metadata';
import { SITE_EMAIL } from '@/lib/site';
import Reveal from '@/components/motion/Reveal';
import UnderlineLink from '@/components/motion/UnderlineLink';
import MagneticButton from '@/components/motion/MagneticButton';

export const metadata = buildPageMetadata({
  title: 'About',
  description:
    'Nima Hakimi — frontend developer with a designer’s eye, building accessible, expressive web interfaces. Experience, education, and skills.',
  path: '/about',
});

/** Small mono-labelled section header with a hairline rule beneath it. */
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <Reveal>
      <h2 className="mono-label">{children}</h2>
    </Reveal>
  );
}

export default function AboutPage() {
  return (
    <article className="py-12 sm:py-16">
      {/* Intro — developer-first identity, design taste as the edge */}
      <header className="max-w-5xl">
        <Reveal>
          <div className="mb-[clamp(1.25rem,4vh,2.25rem)] flex items-center gap-3">
            <span aria-hidden className="h-px w-7 bg-accent" />
            <span className="mono-label text-accent">About</span>
          </div>
        </Reveal>

        <h1
          className="font-display font-bold leading-[1.04] tracking-tight"
          style={{ fontSize: 'clamp(2.25rem, 6.5vw, 4.5rem)' }}
        >
          <span className="block overflow-hidden">
            <Reveal>I’m a frontend developer</Reveal>
          </span>
          <span className="block overflow-hidden">
            <Reveal delay={0.06}>
              with a designer’s <span className="text-accent">eye.</span>
            </Reveal>
          </span>
        </h1>

        <Reveal delay={0.12} className="mt-[clamp(1.5rem,5vh,2.5rem)]">
          <p className="measure text-[clamp(1rem,2vw,1.25rem)] leading-relaxed text-muted">
            I build <span className="text-ink">accessible</span>, <span className="text-ink">expressive</span>{' '}
            interfaces with React, TypeScript and Kotlin. Engineering comes first — but a feel for typography, motion
            and detail is the edge that makes the work land. Currently building platform frontend at{' '}
            <span className="text-ink">NAV</span>, based in {about.location}.
          </p>
        </Reveal>

        <Reveal delay={0.2} className="mt-[clamp(1.75rem,6vh,2.75rem)]">
          <div className="flex flex-wrap items-center gap-x-8 gap-y-4">
            <MagneticButton href="/contact">Get in touch</MagneticButton>
            {about.profiles.map((profile) => (
              <UnderlineLink
                key={profile.platform}
                href={profile.url}
                target="_blank"
                rel="noreferrer"
                className="font-mono text-xs uppercase tracking-[0.12em] text-muted"
              >
                {profile.platform}
              </UnderlineLink>
            ))}
            <UnderlineLink
              href="/cv.pdf"
              className="font-mono text-xs uppercase tracking-[0.12em] text-muted"
            >
              CV ↓
            </UnderlineLink>
          </div>
        </Reveal>
      </header>

      {/* Experience — hairline-separated rows */}
      <section className="mt-[clamp(4rem,12vh,7rem)]">
        <SectionLabel>Experience</SectionLabel>

        <div className="mt-6 border-t border-white/10">
          {about.experience.map((exp, i) => (
            <Reveal key={`${exp.company}-${exp.title}`} delay={i * 0.04}>
              <div className="grid grid-cols-1 gap-y-3 border-b border-white/10 py-7 md:grid-cols-[10rem_1fr] md:gap-x-8">
                <div className="flex flex-col gap-1">
                  <span className="font-mono text-xs tabular-nums tracking-tight text-muted">{exp.period}</span>
                  {exp.location && (
                    <span className="font-mono text-[0.6875rem] uppercase tracking-[0.12em] text-muted">
                      {exp.location}
                    </span>
                  )}
                </div>

                <div>
                  <h3 className="font-display text-xl font-semibold leading-snug sm:text-2xl">
                    {exp.title}
                    {exp.company ? (
                      <>
                        {' '}
                        <span className="text-muted">@</span> {exp.company}
                      </>
                    ) : null}
                  </h3>
                  <ul className="measure mt-3 space-y-2">
                    {exp.details.map((detail, j) => {
                      const techMatch = detail.match(/^Technologies:\s*(.+)$/);
                      if (techMatch) {
                        return (
                          <li key={j} className="flex flex-wrap gap-2 pt-1">
                            {techMatch[1].split(/,\s*/).map((tech) => (
                              <span
                                key={tech}
                                className="rounded-full border border-white/10 px-2.5 py-1 font-mono text-[0.6875rem] text-muted"
                              >
                                {tech}
                              </span>
                            ))}
                          </li>
                        );
                      }
                      return (
                        <li key={j} className="text-[0.9375rem] leading-relaxed text-muted">
                          {detail}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Education */}
      <section className="mt-[clamp(4rem,12vh,7rem)]">
        <SectionLabel>Education</SectionLabel>

        <div className="mt-6 border-t border-white/10">
          {about.education.map((edu, i) => (
            <Reveal key={`${edu.institution}-${edu.degree}`} delay={i * 0.04}>
              <div className="grid grid-cols-1 gap-y-2 border-b border-white/10 py-6 md:grid-cols-[10rem_1fr] md:gap-x-8">
                <span className="font-mono text-xs tabular-nums tracking-tight text-muted">{edu.period}</span>
                <div>
                  <h3 className="font-medium leading-snug sm:text-lg">
                    {edu.degree} <span className="text-muted">@</span> {edu.institution}
                  </h3>
                  <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-sm text-muted">
                    {edu.location && <span>{edu.location}</span>}
                    {edu.details?.map((detail) => (
                      <span key={detail} className="text-muted">
                        {detail}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Skills + Languages + Interests grid */}
      <section className="mt-[clamp(4rem,12vh,7rem)] grid grid-cols-1 gap-x-12 gap-y-12 lg:grid-cols-2">
        <div>
          <SectionLabel>Technical</SectionLabel>
          <Reveal delay={0.04}>
            <ul className="mt-6 flex flex-wrap gap-2">
              {about.skills.technical.map((skill) => (
                <li
                  key={skill}
                  className="rounded-full border border-white/10 px-3 py-1.5 font-mono text-xs text-muted transition-colors hover:border-accent/40 hover:text-ink"
                >
                  {skill}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>

        <div>
          <SectionLabel>Strengths</SectionLabel>
          <Reveal delay={0.04}>
            <ul className="mt-6 flex flex-wrap gap-2">
              {about.skills.personal.map((skill) => (
                <li
                  key={skill}
                  className="rounded-full border border-white/10 px-3 py-1.5 font-mono text-xs text-muted transition-colors hover:border-accent/40 hover:text-ink"
                >
                  {skill}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>

        <div>
          <SectionLabel>Languages</SectionLabel>
          <div className="mt-6 border-t border-white/10">
            {about.languages.map((language, i) => (
              <Reveal key={language.name} delay={i * 0.03}>
                <div className="flex items-center justify-between gap-4 border-b border-white/10 py-3">
                  <span className="text-sm">{language.name}</span>
                  <span aria-hidden className="flex gap-1.5">
                    {Array.from({ length: 5 }).map((_, dot) => (
                      <span
                        key={dot}
                        className={`h-1.5 w-1.5 rounded-full ${
                          dot < language.proficiency ? 'bg-accent' : 'bg-white/15'
                        }`}
                      />
                    ))}
                  </span>
                  <span className="sr-only">
                    Proficiency {language.proficiency} of 5
                  </span>
                </div>
              </Reveal>
            ))}
          </div>
        </div>

        <div>
          <SectionLabel>Interests</SectionLabel>
          <Reveal delay={0.04}>
            <ul className="mt-6 flex flex-wrap gap-2">
              {about.interests.map((interest) => (
                <li
                  key={interest}
                  className="rounded-full border border-white/10 px-3 py-1.5 font-mono text-xs text-muted"
                >
                  {interest}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </section>

      {/* Closing contact nudge */}
      <section className="mt-[clamp(4rem,12vh,7rem)] border-t border-white/10 pt-12">
        <Reveal>
          <p className="measure text-lg leading-relaxed text-muted sm:text-xl">
            Want to know more about my work, or talk about a role?{' '}
            <UnderlineLink href="/contact" className="text-ink">
              Send me a message
            </UnderlineLink>{' '}
            or email{' '}
            <UnderlineLink href={`mailto:${SITE_EMAIL}`} className="text-ink">
              {SITE_EMAIL}
            </UnderlineLink>
            .
          </p>
        </Reveal>
      </section>
    </article>
  );
}
