"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, Star, Calendar, Film, Tv, ExternalLink } from "lucide-react";

export interface ExternalComingSoonItem {
  tmdbId:      number;
  title:       string;
  overview:    string;
  poster:      string | null;
  backdrop:    string | null;
  releaseDate: string | null;
  releaseYear: string | null;
  rating:      number;
  source:      "tmdb";
  mediaType:   "movie" | "series";
}

interface ExternalComingSoonProps {
  movies:  ExternalComingSoonItem[];
  series:  ExternalComingSoonItem[];
}

export function ExternalComingSoon({ movies, series }: ExternalComingSoonProps) {
  const [scrollPos, setScrollPos] = useState(0);

  const items = [
    ...movies.map(m => ({ ...m, mediaType: "movie"  as const })),
    ...series.map(s => ({ ...s, mediaType: "series" as const })),
  ];

  if (items.length === 0) return null;

  const scroll = (dir: "left" | "right") => {
    const el = document.getElementById("ext-coming-soon-scroll");
    if (!el) return;
    const amt = el.offsetWidth;
    const next = dir === "left" ? Math.max(0, scrollPos - amt) : scrollPos + amt;
    el.scrollTo({ left: next, behavior: "smooth" });
    setScrollPos(next);
  };

  return (
    <section className="relative">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">🌍 Coming Soon Worldwide</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Upcoming releases from TMDB — not yet available on FlickerPlay
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => scroll("left")} className="hover:bg-secondary">
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => scroll("right")} className="hover:bg-secondary">
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>
      </div>

      <div
        id="ext-coming-soon-scroll"
        className="flex gap-4 overflow-x-auto pb-3"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {items.map(item => {
          const img = item.backdrop || item.poster;
          return (
            <div
              key={`${item.mediaType}-${item.tmdbId}`}
              className="group relative shrink-0 w-64 md:w-72 rounded-xl overflow-hidden bg-card border border-border hover:border-orange-500/50 transition-all duration-300"
            >
              {/* Image */}
              <div className="relative aspect-video w-full">
                {img ? (
                  <Image
                    src={img}
                    alt={item.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    sizes="288px"
                  />
                ) : (
                  <div className="w-full h-full bg-muted flex items-center justify-center">
                    {item.mediaType === "movie"
                      ? <Film className="w-10 h-10 text-muted-foreground" />
                      : <Tv   className="w-10 h-10 text-muted-foreground" />}
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                {/* Badges */}
                <div className="absolute top-2 left-2 flex gap-1.5">
                  <Badge className={item.mediaType === "movie" ? "bg-purple-600 text-xs" : "bg-blue-600 text-xs"}>
                    {item.mediaType === "movie" ? "Movie" : "Series"}
                  </Badge>
                  <Badge className="bg-orange-600 text-xs">Coming Soon</Badge>
                </div>

                {/* Rating */}
                {item.rating > 0 && (
                  <div className="absolute top-2 right-2 flex items-center gap-1 bg-black/70 rounded px-1.5 py-0.5">
                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                    <span className="text-[10px] font-bold text-white">{item.rating.toFixed(1)}</span>
                  </div>
                )}

                {/* Title + date */}
                <div className="absolute bottom-0 left-0 right-0 p-3">
                  <p className="text-white font-bold text-sm line-clamp-1">{item.title}</p>
                  {item.releaseDate && (
                    <div className="flex items-center gap-1 mt-0.5">
                      <Calendar className="w-3 h-3 text-orange-400" />
                      <span className="text-[10px] text-orange-300">{item.releaseDate}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Description */}
              <div className="p-3">
                <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                  {item.overview || "No description available."}
                </p>
                <div className="flex items-center gap-1 mt-2 text-[10px] text-muted-foreground/60">
                  <ExternalLink className="w-3 h-3" />
                  <span>Source: TMDB</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
