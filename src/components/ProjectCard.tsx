import Image from 'next/image';

export type ProjectCardProps = {
  title: string;
  description: string;
  href: string;
  imageSrc?: string;
  tags?: string[];
  index?: number;
};

export function ProjectCard({ title, description, href, imageSrc, tags, index = 0 }: ProjectCardProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="group relative overflow-hidden rounded-xl border border-light-accent/20 dark:border-dark-accent/20 bg-white/60 dark:bg-black/20 backdrop-blur shadow-sm transition-transform duration-200 ease-out hover:-translate-y-1 animate-fade-in-up"
      style={{ animationDelay: `${index * 70}ms` }}
    >
      {imageSrc ? (
        <div className="relative h-40 w-full">
          <Image
            src={imageSrc}
            alt={title}
            fill
            className="object-cover opacity-90 group-hover:opacity-100 transition-opacity"
            sizes="(min-width: 1024px) 384px, (min-width: 640px) 50vw, 100vw"
            priority={index === 0}
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      ) : null}

      <div className="p-4 space-y-2">
        <h3 className="font-semibold text-lg">{title}</h3>
        <p className="text-sm text-light-secondary dark:text-dark-secondary">{description}</p>
        {tags && tags.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-2">
            {tags.map((t) => (
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
    </a>
  );
}
