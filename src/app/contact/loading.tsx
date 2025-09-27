export default function LoadingContactPage() {
  return (
    <div className="max-w-4xl mx-auto animate-pulse">
      <div className="text-center space-y-2 mb-8">
        <div className="mx-auto h-5 w-20 rounded-full bg-light-accent/20 dark:bg-dark-accent/20" />
        <div className="mx-auto h-10 w-60 rounded-full bg-light-accent/30 dark:bg-dark-accent/20" />
      </div>
      <div className="mx-auto w-full max-w-lg space-y-4 rounded-xl border border-light-accent/20 dark:border-dark-accent/20 bg-white/40 dark:bg-black/20 p-6 backdrop-blur">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="space-y-2">
            <div className="h-4 w-24 rounded bg-light-accent/20 dark:bg-dark-accent/20" />
            <div className={`rounded bg-light-accent/10 dark:bg-dark-accent/10 ${index === 3 ? 'h-24' : 'h-10'}`} />
          </div>
        ))}
        <div className="h-10 w-32 rounded bg-light-accent/20 dark:bg-dark-accent/20" />
      </div>
    </div>
  );
}
