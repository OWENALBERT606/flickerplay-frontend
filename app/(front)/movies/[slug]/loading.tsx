export default function MovieDetailLoading() {
  return (
    <div className="min-h-screen bg-black animate-pulse">
      {/* Player area */}
      <div className="w-full aspect-video bg-zinc-900" />

      <div className="container mx-auto px-4 md:px-8 lg:px-16 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left column */}
          <div className="lg:col-span-2 space-y-8">
            <div className="space-y-3">
              <div className="h-9 w-2/3 rounded bg-zinc-800" />
              <div className="h-4 w-1/3 rounded bg-zinc-800" />
              <div className="h-4 w-full rounded bg-zinc-800" />
              <div className="h-4 w-full rounded bg-zinc-800" />
              <div className="h-4 w-4/5 rounded bg-zinc-800" />
            </div>
            {/* Trailer placeholder */}
            <div className="w-full aspect-video rounded-xl bg-zinc-900" />
          </div>

          {/* Right column */}
          <div className="space-y-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="rounded-lg bg-zinc-900 p-6 space-y-3">
                <div className="h-4 w-20 rounded bg-zinc-800" />
                <div className="h-4 w-32 rounded bg-zinc-800" />
              </div>
            ))}
          </div>
        </div>

        {/* Related movies */}
        <div className="mt-16 space-y-4">
          <div className="h-6 w-40 rounded bg-zinc-800" />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="aspect-[2/3] rounded-lg bg-zinc-900" />
                <div className="h-3 rounded bg-zinc-900 w-3/4" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
