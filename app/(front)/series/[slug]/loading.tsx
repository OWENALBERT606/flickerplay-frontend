export default function SeriesDetailLoading() {
  return (
    <div className="min-h-screen bg-background animate-pulse">
      {/* Hero area */}
      <div className="w-full h-[70vh] bg-muted" />

      <div className="container mx-auto px-4 md:px-12 lg:px-24 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Seasons */}
            <div className="space-y-4">
              <div className="h-7 w-32 rounded bg-muted" />
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="rounded-lg border border-muted p-6 flex gap-4 items-center">
                  <div className="w-24 h-36 rounded-lg bg-muted shrink-0" />
                  <div className="flex-1 space-y-3">
                    <div className="h-5 w-40 rounded bg-muted" />
                    <div className="h-4 w-full rounded bg-muted" />
                    <div className="h-4 w-24 rounded bg-muted" />
                  </div>
                </div>
              ))}
            </div>

            {/* Trailer placeholder */}
            <div className="space-y-3">
              <div className="h-7 w-24 rounded bg-muted" />
              <div className="w-full aspect-video rounded-xl bg-muted" />
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="rounded-lg border border-muted p-4">
              <div className="aspect-[2/3] rounded-lg bg-muted" />
            </div>
            <div className="rounded-lg border border-muted p-6 space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="space-y-1">
                  <div className="h-3 w-16 rounded bg-muted" />
                  <div className="h-4 w-28 rounded bg-muted" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
