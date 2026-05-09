export default function SeriesLoading() {
  return (
    <div className="min-h-screen bg-background animate-pulse">
      <main className="pt-20 px-4 md:px-8 lg:px-12 pb-12">
        <div className="flex flex-col lg:flex-row gap-4 lg:gap-8">
          {/* Sidebar skeleton */}
          <div className="hidden lg:block w-64 shrink-0 space-y-4">
            <div className="h-10 rounded-lg bg-muted" />
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-8 rounded bg-muted" />
            ))}
          </div>

          {/* Main content */}
          <div className="flex-1 min-w-0">
            {/* Heading */}
            <div className="mb-6 space-y-2">
              <div className="h-8 w-56 rounded bg-muted" />
              <div className="h-4 w-28 rounded bg-muted" />
            </div>

            {/* Series card grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4">
              {Array.from({ length: 20 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <div className="aspect-[2/3] rounded-lg bg-muted" />
                  <div className="h-3 rounded bg-muted w-3/4" />
                  <div className="h-3 rounded bg-muted w-1/2" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
