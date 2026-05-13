"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, Star, Clock } from "lucide-react";
import type { Series } from "@/actions/series";
import { AddToListButton } from "../../movies/components/add-to-list-button";
import { cleanTitle } from "@/lib/utils";

interface SeriesGridProps {
  series: Series[];
  userId?: string | null;
}

export function SeriesGrid({ series, userId }: SeriesGridProps) {
  const [hoveredSeries, setHoveredSeries] = useState<string | null>(null);

  if (series.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-xl text-muted-foreground">No series found</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
      {series.map((s) => (
        <div
          key={s.id}
          className="group cursor-pointer relative overflow-hidden rounded-lg bg-card transition-transform duration-300 hover:scale-105 hover:z-10"
          onMouseEnter={() => setHoveredSeries(s.id)}
          onMouseLeave={() => setHoveredSeries(null)}
        >
          {/* Poster Image */}
          <div className="relative aspect-[2/3] w-full">
            <Link href={s.isComingSoon ? "#" : `/series/${s.slug}`}>
              <Image
                src={s.poster}
                alt={s.title}
                fill
                className={`object-cover rounded-lg ${s.isComingSoon ? "grayscale group-hover:grayscale-0" : ""}`}
                sizes="(max-width: 768px) 50vw, (max-width: 1024px) 25vw, 16.66vw"
              />

              {/* Gradient Overlay (Always visible at bottom) */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent rounded-lg pointer-events-none" />

              {/* Title & Info (Always visible) */}
              <div className="absolute bottom-0 left-0 right-0 p-3 pointer-events-none">
                <h3 className="text-white font-bold text-sm mb-1 line-clamp-2">
                  {cleanTitle(s.title)}
                </h3>
                <div className="flex items-center gap-2 text-xs text-white/80">
                  <span>{s.year.value}</span>
                  <span>•</span>
                  <span>{s.genre.name}</span>
                </div>
                <p className="text-xs text-white/70 mt-1">
                  {s.totalSeasons} Season{s.totalSeasons !== 1 ? "s" : ""} • {s.totalEpisodes} Eps
                </p>
                {s.vj && (
                  <p className="text-xs text-white/70">
                    {s.vj.name}
                  </p>
                )}
              </div>
            </Link>

            {/* Action Buttons - Only visible on hover */}
            <div className="absolute bottom-16 left-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20 pointer-events-auto">
              {/* Play/Coming Soon Button */}
              {s.isComingSoon ? (
                <Button 
                  className="h-10 w-10 rounded-full bg-blue-600 hover:bg-blue-700 p-0 flex items-center justify-center"
                  disabled
                  title="Coming Soon"
                >
                  <Clock className="h-5 w-5 text-white" />
                </Button>
              ) : (
                <Link href={`/series/${s.slug}`}>
                  <Button 
                    className="h-10 w-10 rounded-full bg-orange-500 hover:bg-orange-600 p-0 flex items-center justify-center"
                    title="Play"
                  >
                    <Play className="h-5 w-5 text-white fill-white" />
                  </Button>
                </Link>
              )}

              {/* Add to List Button */}
              <AddToListButton
                itemId={s.id}
                type="series"
                userId={userId || undefined}
                variant="secondary"
                size="icon"
                showText={false}
                className="h-10 w-10 rounded-full bg-gray-800/80 hover:bg-gray-700 border-0 backdrop-blur-sm"
              />

              {/* Download Button (Optional) */}
              <Button 
                className="h-10 w-10 rounded-full bg-gray-800/80 hover:bg-gray-700 p-0 flex items-center justify-center border-0 backdrop-blur-sm"
                title="Download"
              >
                <svg 
                  className="h-5 w-5 text-white" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" 
                  />
                </svg>
              </Button>
            </div>
          </div>

          {/* Rating Badge */}
          <div className="absolute top-3 right-3 z-10">
            <Badge className="bg-orange-500 text-white border-0 flex items-center gap-1 px-2 py-1">
              <Star className="h-3 w-3 fill-white text-white" />
              <span className="font-bold">{s.rating.toFixed(1)}</span>
            </Badge>
          </div>

          {/* Trending Badge */}
          {s.isTrending && !s.isComingSoon && (
            <div className="absolute top-3 left-3 z-10">
              <Badge className="bg-red-600 text-white border-0 px-2 py-1 flex items-center gap-1">
                <span className="text-sm">🔥</span>
                <span className="font-bold text-xs">Trending</span>
              </Badge>
            </div>
          )}

          {/* Coming Soon Badge */}
          {s.isComingSoon && (
            <div className="absolute top-3 left-3 z-10">
              <Badge className="bg-blue-600 text-white border-0 animate-pulse px-2 py-1">
                <Clock className="h-3 w-3 mr-1" />
                <span className="font-bold text-xs">Coming Soon</span>
              </Badge>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
