import Link from "next/link"
import { ChevronRight } from "lucide-react"
import { MovieGrid } from "./movies-grid"
import type { Movie } from "@/actions/movies"

interface MovieSectionProps {
  title: string
  icon?: string
  movies: Movie[]
  viewAllHref: string
  cols?: 2 | 3 | 4 | 5 | 6 | 7 | 9
  emptyMessage?: string
}

export function MovieSection({
  title,
  icon,
  movies,
  viewAllHref,
  cols = 9,
  emptyMessage,
}: MovieSectionProps) {
  if (movies.length === 0) return null

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
          {icon && <span>{icon}</span>}
          {title}
        </h2>
        <Link
          href={viewAllHref}
          className="flex items-center gap-1 text-sm text-orange-500 hover:text-orange-400 font-medium transition-colors"
        >
          View All
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>
      <MovieGrid movies={movies.slice(0, 18)} cols={cols} emptyMessage={emptyMessage} />
    </section>
  )
}
