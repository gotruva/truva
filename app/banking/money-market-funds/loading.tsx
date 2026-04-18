export default function Loading() {
  return (
    <div className="px-4 py-6 max-w-6xl mx-auto">
      {/* Header skeleton */}
      <div className="mb-6 space-y-2">
        <div className="h-8 w-64 bg-brand-surface dark:bg-white/[0.06] rounded-lg animate-pulse" />
        <div className="h-4 w-96 bg-brand-surface dark:bg-white/[0.04] rounded-lg animate-pulse" />
      </div>

      {/* Benchmark bar skeleton */}
      <div className="h-12 bg-brand-surface dark:bg-white/[0.04] border border-brand-border dark:border-white/10 rounded-xl mb-6 animate-pulse" />

      {/* Section heading skeleton */}
      <div className="h-5 w-48 bg-brand-surface dark:bg-white/[0.06] rounded-lg mb-4 animate-pulse" />

      {/* Card skeletons */}
      <div className="space-y-3">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="h-52 bg-brand-surface dark:bg-white/[0.04] border border-brand-border dark:border-white/10 rounded-[1.4rem] animate-pulse"
          />
        ))}
      </div>
    </div>
  )
}
