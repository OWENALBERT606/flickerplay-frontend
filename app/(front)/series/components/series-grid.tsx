"use client";

import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Star, Clock } from "lucide-react";
import type { Series } from "@/actions/series";
import { cleanTitle } from "@/lib/utils";

interface SeriesGridProps {
  series: Series[];
  userId?: string | null;
}

export function SeriesGrid({ series }: SeriesGridProps) {

  if (series.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-xl text-muted-foreground">No series found</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-7 lg:grid-cols-7 gap-3 md:gap-4">
      {series.map((s) => (
        <div
          key={s.id}
          className="group relative overflow-hidden rounded-lg bg-card transition-transform duration-300 hover:scale-105 hover:z-10"
        >
          {/* Entire card is one link to the detail page */}
          <Link
            href={s.isComingSoon ? "#" : `/series/${s.slug}`}
            className={`block relative aspect-[2/3] w-full ${s.isComingSoon ? "cursor-not-allowed pointer-events-none" : ""}`}
          >
            <Image
              src={s.poster}
              alt={s.title}
              fill
              className={`object-cover rounded-lg ${s.isComingSoon ? "grayscale group-hover:grayscale-0" : ""}`}
              sizes="(max-width: 640px) 33vw, (max-width: 768px) 33vw, (max-width: 1024px) 14vw, 14vw"
            />

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent rounded-lg pointer-events-none" />

            {/* Title & Info */}
            <div className="absolute bottom-0 left-0 right-0 p-2 pointer-events-none">
              <h3 className="text-white font-bold text-xs mb-0.5 line-clamp-2">
                {cleanTitle(s.title)}
              </h3>
              <div className="flex items-center gap-1.5 text-[10px] text-white/80">
                <span>{s.year.value}</span>
                <span>•</span>
                <span className="truncate">{s.genre.name}</span>
              </div>
              <p className="text-[10px] text-white/70 mt-0.5">
                {s.totalSeasons} Season{s.totalSeasons !== 1 ? "s" : ""} • {s.totalEpisodes} Eps
              </p>
              {s.vj && (
                <p className="text-[10px] text-white/70">{s.vj.name}</p>
              )}
            </div>
          </Link>

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
