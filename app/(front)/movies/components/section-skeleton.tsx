import { Skeleton } from "@/components/ui/skeleton"

interface SectionSkeletonProps {
  count?: number
}

export function SectionSkeleton({ count = 6 }: SectionSkeletonProps) {
  return (
    <section className="space-y-3">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-7 w-48" />
        <Skeleton className="h-5 w-16" />
      </div>
      {/* Movie card grid */}
      <div className="grid grid-cols-3 sm:grid-cols-6 md:grid-cols-9 gap-3">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="aspect-[2/3] w-full rounded-lg" />
          </div>
        ))}
      </div>
    </section>
  )
}
