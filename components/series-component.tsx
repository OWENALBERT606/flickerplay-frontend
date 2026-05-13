"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Play, Plus, Star } from "lucide-react";
import { cleanTitle } from "@/lib/utils";
import type { Series } from "@/actions/series";
import { AddToListButton } from "@/app/(front)/movies/components/add-to-list-button";

interface SeriesSectionProps {
  title: string;
  series: Series[];
  userId?: string | null;
}

export function SeriesSection({ title, series, userId }: SeriesSectionProps) {
  const [scrollPosition, setScrollPosition] = useState(0);
  const [hoveredSeries, setHoveredSeries] = useState<string | null>(null);

  const scroll = (direction: "left" | "right") => {
    const container = document.getElementById(`scroll-${title.replace(/\s+/g, "-")}`);
    if (container) {
      const scrollAmount = container.offsetWidth;
      const newPosition =
        direction === "left"
          ? Math.max(0, scrollPosition - scrollAmount)
          : scrollPosition + scrollAmount;

      container.scrollTo({ left: newPosition, behavior: "smooth" });
      setScrollPosition(newPosition);
    }
  };

  if (series.length === 0) {
    return null;
  }

  return (
    <section className="relative">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-foreground">{title}</h2>
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => scroll("left")}
            className="hover:bg-secondary"
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => scroll("right")}
            className="hover:bg-secondary"
          >
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>
      </div>

      <div
        id={`scroll-${title.replace(/\s+/g, "-")}`}
        className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 overflow-x-auto scrollbar-hide pb-4"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {series.map((s) => (
          <div
            key={s.id}
            className="group cursor-pointer min-w-0"
            onMouseEnter={() => setHoveredSeries(s.id)}
            onMouseLeave={() => setHoveredSeries(null)}
          >
            <div className="relative overflow-hidden rounded-lg bg-card transition-transform duration-300 group-hover:scale-105 group-hover:z-10">
              <div className="relative aspect-[2/3] w-full">
                <Image
                  src={s.poster}
                  alt={s.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 50vw, (max-width: 1024px) 25vw, 16.66vw"
                />
              </div>

              {/* Hover Overlay */}
              <div
                className={`absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent transition-opacity duration-300 ${
                  hoveredSeries === s.id ? "opacity-100" : "opacity-0"
                }`}
              >
                <div className="absolute bottom-0 left-0 right-0 p-3 space-y-2">
                  <div className="flex items-center justify-between gap-1">
                    <div className="flex items-center space-x-1">
                      <Button
                        size="sm"
                        className="bg-orange-500 hover:bg-orange-600 h-7 w-7 p-0"
                        asChild
                      >
                        <Link href={`/series/${s.slug}`}>
                          <Play className="w-3 h-3 fill-white" />
                        </Link>
                      </Button>
                       <AddToListButton
                                      itemId={s.id}
                                      type="series"
                                      userId={userId || undefined}
                                      variant="secondary"
                                      size="icon"
                                      showText={false}
                                      className="h-10 w-10 rounded-full bg-gray-800/80 hover:bg-gray-700 border-0 backdrop-blur-sm"
                                    />
                    </div>
                    <div className="flex items-center space-x-1 text-orange-500">
                      <Star className="w-3 h-3 fill-current" />
                      <span className="text-xs font-medium">{s.rating.toFixed(1)}</span>
                    </div>
                  </div>

                  <div className="space-y-0.5">
                    <h3 className="font-semibold text-white text-balance line-clamp-2 text-xs leading-tight">
                      {cleanTitle(s.title)}
                    </h3>
                    <div className="flex items-center space-x-1.5 text-[10px] text-white/70">
                      <span>{s.year.value}</span>
                      <span>•</span>
                      <span className="truncate">{s.genre.name}</span>
                    </div>
                    <div className="text-[10px] text-white/60">
                      {s.totalSeasons} Season{s.totalSeasons !== 1 ? "s" : ""} •{" "}
                      {s.totalEpisodes} Eps
                    </div>
                  </div>
                </div>
              </div>

              {/* Trending Badge */}
              {s.isTrending && (
                <div className="absolute top-2 left-2 z-10">
                  <span className="px-1.5 py-0.5 bg-red-600 text-white text-[10px] font-semibold rounded">
                    🔥 Trending
                  </span>
                </div>
              )}

              {/* Coming Soon Badge */}
              {s.isComingSoon && (
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
                    {s.rating.toFixed(1)}
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
  );
}