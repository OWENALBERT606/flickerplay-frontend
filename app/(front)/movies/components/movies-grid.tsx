"use client"

import Link from "next/link"
import Image from "next/image"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Star, Clock } from "lucide-react"
import { cleanTitle } from "@/lib/utils"
import type { Movie } from "@/actions/movies"

interface MovieGridProps {
  movies: Movie[]
  userId?: string
}

export function MovieGrid({ movies }: MovieGridProps) {
  if (movies.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-xl text-muted-foreground">No movies found</p>
        <p className="text-sm text-muted-foreground mt-2">Try adjusting your filters</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-7 gap-3">
      {movies.map((movie) => (
        <Card
          key={movie.id}
          className="group relative overflow-hidden cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-2xl border-0 bg-transparent p-0"
        >
          {/* Entire poster is one big link to detail page */}
          <Link
            href={movie.isComingSoon ? "#" : `/movies/${movie.slug}`}
            className={`block relative aspect-[2/3] w-full ${movie.isComingSoon ? "cursor-not-allowed pointer-events-none" : ""}`}
          >
            <Image
              src={movie.poster || movie.image}
              alt={movie.title}
              fill
              sizes="(max-width: 640px) 33vw, (max-width: 768px) 25vw, (max-width: 1024px) 20vw, 14vw"
              className={`object-cover rounded-lg ${movie.isComingSoon ? "grayscale group-hover:grayscale-0" : ""}`}
            />
            {/* Gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent rounded-lg pointer-events-none" />

            {/* Title & Info */}
            <div className="absolute bottom-0 left-0 right-0 p-3 pointer-events-none">
              <h3 className="text-white font-bold text-sm mb-1 line-clamp-2">{cleanTitle(movie.title)}</h3>
              <div className="flex items-center gap-2 text-xs text-white/80">
                <span>{movie.year?.value || "N/A"}</span>
                <span>•</span>
                <span>{movie.genre?.name || "N/A"}</span>
              </div>
              {movie.vj && <p className="text-xs text-white/70 mt-1">{movie.vj.name}</p>}
            </div>

            {/* Rating / Source Badge */}
            <div className="absolute top-3 right-3 z-10">
              {movie.source === "tx" ? (
                <Badge className="bg-orange-500/90 text-white border-0 px-2 py-1 text-xs font-bold">
                  SC1
                </Badge>
              ) : (
                <Badge className="bg-orange-500 text-white border-0 flex items-center gap-1 px-2 py-1">
                  <Star className="h-3 w-3 fill-white text-white" />
                  <span className="font-bold">{(movie.rating ?? 0).toFixed(1)}</span>
                </Badge>
              )}
            </div>

            {/* Trending Badge */}
            {movie.isTrending && !movie.isComingSoon && (
              <div className="absolute top-3 left-3 z-10">
                <Badge className="bg-red-600 text-white border-0 px-2 py-1 flex items-center gap-1">
                  <span className="text-sm">🔥</span>
                  <span className="font-bold text-xs">Trending</span>
                </Badge>
              </div>
            )}

            {/* Coming Soon Badge */}
            {movie.isComingSoon && (
              <div className="absolute top-3 left-3 z-10">
                <Badge className="bg-blue-600 text-white border-0 animate-pulse px-2 py-1">
                  <Clock className="h-3 w-3 mr-1" />
                  <span className="font-bold text-xs">Coming Soon</span>
                </Badge>
              </div>
            )}
          </Link>

        </Card>
      ))}
    </div>
  )
}
