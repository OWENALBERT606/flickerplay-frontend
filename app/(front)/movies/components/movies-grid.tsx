"use client"

import Link from "next/link"
import Image from "next/image"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Star, Play, Clock, Download } from "lucide-react"
import { cleanTitle } from "@/lib/utils"
import type { Movie } from "@/actions/movies"
import { AddToListButton } from "./add-to-list-button"

interface MovieGridProps {
  movies: Movie[]
  userId?: string
}

export function MovieGrid({ movies, userId }: MovieGridProps) {
  if (movies.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-xl text-muted-foreground">No movies found</p>
        <p className="text-sm text-muted-foreground mt-2">Try adjusting your filters</p>
      </div>
    )
  }

  const handleDownload = (movie: Movie, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const url = movie.videoUrl;
    if (!url) return;
    const ext = url.split("?")[0].split(".").pop() || "mp4";
    const filename = `${movie.title}.${ext}`;
    window.location.href = `/api/download?url=${encodeURIComponent(url)}&filename=${encodeURIComponent(filename)}`;
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
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

            {/* Rating Badge */}
            <div className="absolute top-3 right-3 z-10">
              <Badge className="bg-orange-500 text-white border-0 flex items-center gap-1 px-2 py-1">
                <Star className="h-3 w-3 fill-white text-white" />
                <span className="font-bold">{movie.rating.toFixed(1)}</span>
              </Badge>
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

          {/* Hover action buttons — outside the Link so they don't navigate */}
          {!movie.isComingSoon && (
            <div className="absolute bottom-16 left-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20">
              {/* Play */}
              <Link href={`/movies/${movie.slug}`} onClick={e => e.stopPropagation()}>
                <Button className="h-9 w-9 rounded-full bg-orange-500 hover:bg-orange-600 p-0 flex items-center justify-center" title="Watch">
                  <Play className="h-4 w-4 text-white fill-white" />
                </Button>
              </Link>

              {/* Add to list */}
              <AddToListButton
                itemId={movie.id}
                userId={userId}
                type="movie"
                variant="secondary"
                size="icon"
                showText={false}
                className="h-9 w-9 rounded-full bg-gray-800/80 hover:bg-gray-700 border-0 backdrop-blur-sm"
              />

              {/* Download */}
              {movie.videoUrl && (
                <Button
                  onClick={(e) => handleDownload(movie, e)}
                  className="h-9 w-9 rounded-full bg-gray-800/80 hover:bg-gray-700 p-0 flex items-center justify-center border-0 backdrop-blur-sm"
                  title="Download"
                >
                  <Download className="h-4 w-4 text-white" />
                </Button>
              )}
            </div>
          )}
        </Card>
      ))}
    </div>
  )
}
