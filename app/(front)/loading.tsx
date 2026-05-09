export default function HomeLoading() {
  return (
    <div className="min-h-screen bg-background animate-pulse">
      {/* Hero skeleton */}
      <div className="w-full h-[70vh] bg-muted" />

      <main className="px-4 md:px-8 lg:px-12 py-8">
        <div className="flex flex-col lg:flex-row gap-4 lg:gap-8">
          {/* Sidebar skeleton */}
          <div className="hidden lg:block w-64 shrink-0 space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-9 rounded-lg bg-muted" />
            ))}
          </div>

          {/* Card grid skeleton */}
          <div className="flex-1 space-y-10">
            {Array.from({ length: 2 }).map((_, section) => (
              <div key={section}>
                <div className="h-6 w-48 rounded bg-muted mb-4" />
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="space-y-2">
                      <div className="aspect-[2/3] rounded-lg bg-muted" />
                      <div className="h-3 rounded bg-muted w-3/4" />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
