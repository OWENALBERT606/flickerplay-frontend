"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { ArrowBigDown, ChevronLeft, ChevronRight, Play, Plus, Star, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cleanTitle } from "@/lib/utils"
import type { Movie } from "@/actions/movies"
import { AddToListButton } from "@/app/(front)/movies/components/add-to-list-button"

interface MovieSectionProps {
  title: string
  movies: Movie[]
  userId?: string | null;
  viewAllHref?: string
}

export function MovieSection({ title, movies, userId, viewAllHref = "/movies" }: MovieSectionProps) {
  const [scrollPosition, setScrollPosition] = useState(0)
  const [hoveredMovie, setHoveredMovie] = useState<string | null>(null)

  const scroll = (direction: "left" | "right") => {
    const container = document.getElementById(`scroll-${title.replace(/\s+/g, "-")}`)
    if (container) {
      const scrollAmount = container.offsetWidth
      const newPosition =
        direction === "left" ? Math.max(0, scrollPosition - scrollAmount) : scrollPosition + scrollAmount

      container.scrollTo({ left: newPosition, behavior: "smooth" })
      setScrollPosition(newPosition)
    }
  }

  if (movies.length === 0) {
    return null // Don't render section if no movies
  }

  return (
    <section className="relative">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-foreground">{title}</h2>
        
        <div className="flex items-center gap-3">
          {/* View All Button */}
          <Button 
            variant="ghost" 
            className="text-orange-500 hover:text-orange-600 hover:bg-orange-500/10"
            asChild
          >
            <Link href={viewAllHref}>
              View All
              <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </Button>

          {/* Scroll Buttons */}
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="icon" onClick={() => scroll("left")} className="hover:bg-secondary">
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => scroll("right")} className="hover:bg-secondary">
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>

      <div
        id={`scroll-${title.replace(/\s+/g, "-")}`}
        className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 overflow-x-auto scrollbar-hide pb-4"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {movies.map((movie) => (
          <div
            key={movie.id}
            className="group cursor-pointer min-w-0"
            onMouseEnter={() => setHoveredMovie(movie.id)}
            onMouseLeave={() => setHoveredMovie(null)}
          >
            <div className="relative overflow-hidden rounded-lg bg-card transition-transform duration-300 group-hover:scale-105 group-hover:z-10">
              <div className="relative aspect-[2/3] w-full">
                <Image
                  src={movie.poster || movie.image}
                  alt={movie.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 50vw, (max-width: 1024px) 25vw, 16.66vw"
                />
              </div>

              {/* Hover Overlay */}
              <div
                className={`absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent transition-opacity duration-300 ${
                  hoveredMovie === movie.id ? "opacity-100" : "opacity-0"
                }`}
              >
                <div className="absolute bottom-0 left-0 right-0 p-3 space-y-2">
                  <div className="flex items-center justify-between gap-1">
                    <div className="flex items-center space-x-1.5">
                      <Button 
                        size="sm" 
                        className="bg-orange-500 hover:bg-orange-600 h-7 w-7 p-0 flex items-center justify-center" 
                        asChild
                      >
                        <Link href={`/movies/${movie.slug}`}>
                          <Play className="w-3 h-3 fill-white" />
                        </Link>
                      </Button>
                      <AddToListButton
                        itemId={movie.id}
                        type="movie"
                        userId={userId || undefined}
                        variant="secondary"
                        size="icon"
                        showText={false}
                        className="h-7 w-7 bg-gray-800/80 hover:bg-gray-700 border-0 backdrop-blur-sm"
                      />
                    </div>
                    <div className="flex items-center space-x-1 text-orange-500">
                      <Star className="w-3 h-3 fill-current" />
                      <span className="text-xs font-medium">{movie.rating.toFixed(1)}</span>
                    </div>
                  </div>

                  <div className="space-y-0.5">
                    <h3 className="font-semibold text-white text-balance line-clamp-2 text-xs leading-tight">
                    {cleanTitle(movie.title)}
                  </h3>
                    <div className="flex items-center space-x-1.5 text-[10px] text-white/70">
                      <span>{movie.year.value}</span>
                      <span>•</span>
                      <span className="truncate">{movie.genre.name}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Trending Badge */}
              {movie.isTrending && (
                <div className="absolute top-2 left-2 z-10">
                  <span className="px-1.5 py-0.5 bg-red-600 text-white text-[10px] font-semibold rounded">
                    🔥 Trending
                  </span>
                </div>
              )}

              {/* Coming Soon Badge */}
              {movie.isComingSoon && (
                <div className="absolute top-2 left-2 z-10">
                  <span className="px-1.5 py-0.5 bg-blue-600 text-white text-[10px] font-semibold rounded">
                    Coming Soon
                  </span>
                </div>
              )}

              {/* Rating Badge */}
              <div className="absolute top-2 right-2 z-10">
                <div className="flex items-center gap-1 bg-black/70 backdrop-blur-sm rounded px-1.5 py-0.5">
                  <Star className="w-2.5 h-2.5 fill-orange-500 text-orange-500" />
                  <span className="text-[10px] font-bold text-white">
                    {movie.rating.toFixed(1)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </section>
  )
}
