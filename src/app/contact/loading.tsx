export default function LoadingContactPage() {
  return (
    <section className="py-12 sm:py-16" aria-hidden>
      <div className="grid animate-pulse grid-cols-1 gap-x-16 gap-y-12 lg:grid-cols-[1fr_minmax(0,32rem)]">
        {/* Left — invitation */}
        <div className="max-w-xl space-y-6">
          <div className="flex items-center gap-3">
            <span className="h-px w-7 bg-accent/40" />
            <span className="h-3 w-16 rounded bg-muted/20" />
          </div>
          <div className="space-y-3">
            <div className="h-10 w-3/4 rounded-lg bg-ink/10" />
            <div className="h-10 w-2/3 rounded-lg bg-ink/10" />
          </div>
          <div className="space-y-2">
            <div className="h-4 w-full rounded bg-muted/15" />
            <div className="h-4 w-11/12 rounded bg-muted/15" />
            <div className="h-4 w-4/5 rounded bg-muted/15" />
          </div>
        </div>

        {/* Right — form */}
        <div className="flex w-full flex-col gap-5 rounded-2xl border border-white/10 bg-surface/40 p-6 sm:p-8">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="space-y-2">
              <div className="h-3 w-20 rounded bg-muted/20" />
              <div className="h-11 w-full rounded-lg bg-base/60" />
            </div>
          ))}
          <div className="space-y-2">
            <div className="h-3 w-20 rounded bg-muted/20" />
            <div className="h-[140px] w-full rounded-lg bg-base/60" />
          </div>
          <div className="h-11 w-36 rounded-full bg-accent/30" />
        </div>
      </div>
    </section>
  );
}
